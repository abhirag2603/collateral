import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/collateral_db";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// Global in-memory storage for offline mock mode
if (!(global as any).offlineStore) {
  (global as any).offlineStore = {};
}

function matchQuery(item: any, query: any) {
  if (!query) return true;
  for (const [key, val] of Object.entries(query)) {
    if (val && typeof val === "object") {
      if (val instanceof RegExp) {
        if (!val.test(String(item[key]))) return false;
      } else if ((val as any).$regex) {
        const regexStr = (val as any).$regex;
        const regex = regexStr instanceof RegExp ? regexStr : new RegExp(regexStr, "i");
        if (!regex.test(String(item[key]))) return false;
      }
    } else {
      if (String(item[key]) !== String(val)) return false;
    }
  }
  return true;
}

function wrapDoc(modelName: string, doc: any) {
  if (!doc) return null;
  const wrapped = { ...doc };
  wrapped.save = async function() {
    const list = (global as any).offlineStore[modelName] || [];
    const idx = list.findIndex((x: any) => String(x._id) === String(wrapped._id));
    if (idx > -1) {
      list[idx] = { ...wrapped };
    }
    return wrapped;
  };
  wrapped.toObject = () => wrapped;
  wrapped.toJSON = () => wrapped;
  return wrapped;
}

// Monkey-patch Mongoose Model methods for offline capabilities
function enableOfflineMockMode() {
  console.warn("MongoDB unavailable. Activating Offline Mock Mode...");
  
  // Pretend mongoose is connected (readyState = 1) and stub db.collection to prevent compilation crash
  Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });
  (mongoose.connection as any).db = {
    collection: function(name: string) {
      return {
        find: () => ({ toArray: () => [] }),
        findOne: () => null,
        updateOne: () => {},
        deleteOne: () => {},
        createIndex: () => {},
      };
    }
  };

  const mockFind = function(this: any, query = {}) {
    const modelName = this.modelName;
    const list = (global as any).offlineStore[modelName] || [];
    const matched = list.filter((item: any) => matchQuery(item, query));
    
    // Return mock query builder with chainable sort, limit, etc.
    const queryBuilder = {
      sort: function() { return queryBuilder; },
      limit: function() { return queryBuilder; },
      then: function(resolve: any) {
        const wrapped = matched.map((item: any) => wrapDoc(modelName, item));
        return Promise.resolve(resolve ? resolve(wrapped) : wrapped);
      }
    };
    return queryBuilder as any;
  };

  const mockFindOne = function(this: any, query = {}) {
    const modelName = this.modelName;
    const list = (global as any).offlineStore[modelName] || [];
    const matched = list.find((item: any) => matchQuery(item, query));
    const wrapped = wrapDoc(modelName, matched);
    return Promise.resolve(wrapped) as any;
  };

  const mockFindById = function(this: any, id: any) {
    return this.findOne({ _id: id });
  };

  const mockCreate = function(this: any, data: any) {
    const modelName = this.modelName;
    if (!(global as any).offlineStore[modelName]) {
      (global as any).offlineStore[modelName] = [];
    }

    const newDoc = {
      ...data,
      _id: data._id || new mongoose.Types.ObjectId().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (global as any).offlineStore[modelName].push(newDoc);
    const wrapped = wrapDoc(modelName, newDoc);
    return Promise.resolve(wrapped) as any;
  };

  const mockFindOneAndUpdate = function(this: any, query: any, update: any, options: any = {}) {
    const modelName = this.modelName;
    const list = (global as any).offlineStore[modelName] || [];
    let matched = list.find((item: any) => matchQuery(item, query));

    const updateFields = update.$set || update;

    if (matched) {
      Object.assign(matched, updateFields, { updatedAt: new Date() });
    } else if (options.upsert) {
      matched = {
        ...query,
        ...updateFields,
        _id: new mongoose.Types.ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      if (!(global as any).offlineStore[modelName]) {
        (global as any).offlineStore[modelName] = [];
      }
      (global as any).offlineStore[modelName].push(matched);
    }

    const wrapped = wrapDoc(modelName, matched);
    return Promise.resolve(wrapped) as any;
  };

  const mockFindByIdAndUpdate = function(this: any, id: any, update: any, options: any = {}) {
    return this.findOneAndUpdate({ _id: id }, update, options);
  };

  const mockFindOneAndDelete = function(this: any, query: any) {
    const modelName = this.modelName;
    const list = (global as any).offlineStore[modelName] || [];
    const idx = list.findIndex((item: any) => matchQuery(item, query));
    let deleted = null;
    if (idx > -1) {
      deleted = list.splice(idx, 1)[0];
    }
    const wrapped = wrapDoc(modelName, deleted);
    return Promise.resolve(wrapped) as any;
  };

  const mockDeleteMany = function(this: any, query: any) {
    const modelName = this.modelName;
    const list = (global as any).offlineStore[modelName] || [];
    const beforeLength = list.length;
    (global as any).offlineStore[modelName] = list.filter((item: any) => !matchQuery(item, query));
    const deletedCount = beforeLength - (global as any).offlineStore[modelName].length;
    return Promise.resolve({ deletedCount }) as any;
  };

  // Patch mongoose.Model itself as well as any compiled model constructors in the registry
  const targets = [mongoose.Model as any, ...Object.values(mongoose.models)];
  console.log("Offline mode targets found:", Object.keys(mongoose.models));
  
  targets.forEach((target: any) => {
    if (!target) return;
    console.log("Patching model:", target.modelName || "BaseModel");
    target.find = mockFind;
    target.findOne = mockFindOne;
    target.findById = mockFindById;
    target.create = mockCreate;
    target.findOneAndUpdate = mockFindOneAndUpdate;
    target.findByIdAndUpdate = mockFindByIdAndUpdate;
    target.findOneAndDelete = mockFindOneAndDelete;
    target.deleteMany = mockDeleteMany;
  });
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Attempt connection with a short timeout to prevent hanging the dev server
    cached.promise = new Promise(async (resolve) => {
      let timeoutFired = false;
      const timeout = setTimeout(() => {
        timeoutFired = true;
        enableOfflineMockMode();
        resolve(mongoose);
      }, 2000);

      try {
        const conn = await mongoose.connect(MONGODB_URI, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 1500, // Quick timeout for connection attempts
        });
        clearTimeout(timeout);
        if (!timeoutFired) {
          console.log("Connected to MongoDB Atlas.");
          resolve(conn);
        }
      } catch (err: any) {
        clearTimeout(timeout);
        console.error("MongoDB connect error, falling back to mock mode:", err.message);
        if (!timeoutFired) {
          enableOfflineMockMode();
          resolve(mongoose);
        }
      }
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

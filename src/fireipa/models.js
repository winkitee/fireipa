/*
  --- Type ---
  nullValue: null
  booleanValue: boolean
  integerValue: string, doubleValue: number
  timestampValue: string
  stringValue: string
  bytesValue: string
  referenceValue: string
  geoPointValue { object(LatLng) }
  arrayValue: {
    object(ArrayValue)
  }
  mapValue: {
    object(MapValue)
  }
*/

class FireStoreModel {
  constructor(collectionRef, documentType) {
    this.collectionRef = collectionRef;
    this.documentType = documentType;
    this.checkType = type => {
      switch (type) {
        case "nullValue":
          return "null";
        case "booleanValue":
          return "boolean";
        case "numberValue":
          return "number";
        case "timestampValue":
          return "object";
        case "stringValue":
          return "string";
        case "bytesValue":
          return "string";
        case "referenceValue":
          return "object";
        case "geoPointValue":
          return "object";
        case "arrayValue":
          return "object";
        case "mapValue":
          return "object";
        default:
          return "undefined";
      }
    };
  }

  checkDocTypeData(data) {
    return new Promise(resolve => {
      const checkDocTypeData = {};
      const documentLength = Object.keys(this.documentType).length;
      let nullLength = 0;

      try {
        Object.keys(this.documentType).forEach(typeName => {
          const docType = this.checkType(this.documentType[typeName]);
          const isType = typeof data[typeName] === docType;

          // Type match
          if (isType) {
            checkDocTypeData[typeName] = data[typeName];
          }
          // No data
          if (typeof data[typeName] === "undefined") {
            checkDocTypeData[typeName] = null;
            nullLength += 1;

            console.warn(`The "${typeName}" type is undefined.`);
          // Type mismatch
          } else if (!isType) {
            // Check data
            if (data[typeName]) {
              checkDocTypeData[typeName] = data[typeName];
            } else {
              checkDocTypeData[typeName] = null;
              nullLength += 1;
            }

            console.warn(`The "${typeName}" type is not matched.`);
          }
        });

        if (documentLength === nullLength) {
          resolve(false);
        } else {
          resolve(checkDocTypeData);
        }
      } catch (e) {
        resolve(false);
        console.error(e);
      }
    }).then(checkDocTypeData => checkDocTypeData);
  }

  create(docId, data) {
    return new Promise(async resolve => {
      const result = await this.checkDocTypeData(data);
      if (result) {
        this.collectionRef
          .doc(docId)
          .set(result)
          .then(() => {
            resolve(docId);
          })
          .catch(err => resolve(err));
      } else {
        resolve(false);
        console.error("Failed to create data");
      }
    }).then(createdData => createdData);
  }

  update(docId, data) {
    return new Promise(async resolve => {
      const result = await this.checkDocTypeData(data);
      if (result) {
        this.collectionRef
          .doc(docId)
          .update(result)
          .then(() => {
            resolve(docId);
          })
          .catch(err => resolve(err));
      } else {
        resolve(false);
        console.error("Failed to update data");
      }
    });
  }

  add(data) {
    return new Promise(async resolve => {
      const result = await this.checkDocTypeData(data);
      if (result) {
        this.collectionRef
          .add(result)
          .then(docRef => {
            resolve(docRef.id);
          })
          .catch(err => resolve(err));
      } else {
        resolve(false);
        console.error("Failed to add data");
      }
    }).then(addedData => addedData);
  }

  get(uid) {
    return new Promise(resolve => {
      this.collectionRef
        .doc(uid)
        .get()
        .then(async doc => {
          const data = doc.data();
          if (data) {
            const result = await this.checkDocTypeData(data);
            resolve(result);
          } else {
            resolve(false);
            console.error("Failed to get data");
          }
        });
    }).then(data => data);
  }

  getAll() {
    return new Promise(resolve => {
      this.collectionRef
        .get()
        .then(snapshot => {
          const data = [];
          snapshot.forEach(doc => {
            data.push({ ...doc.data(), id: doc.id });
          });
          resolve(data);
        })
        .catch(err => {
          resolve(false);
          console.error("Failed to get all data", err);
        });
    }).then(data => data);
  }
}

class FireStoreDeepModel extends FireStoreModel {
  constructor(collectionRef, deepRef, deepCollectionRef, documentType) {
    super(collectionRef, documentType);

    this.collectionRef = this.collectionRef
      .doc(deepRef)
      .collection(deepCollectionRef);
  }
}

class FireStoreTimestampModel extends FireStoreModel {
  constructor() {
    super();
    this.currentTime = new Date();
  }
}

export default { FireStoreModel, FireStoreDeepModel, FireStoreTimestampModel };

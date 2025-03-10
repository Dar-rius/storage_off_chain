"use strict";

// Deterministic JSON.stringify()
const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const { Contract } = require("fabric-contract-api");
const axios = require("axios");

class AutonomiWasm extends Contract {
  //User Management
  async InitLedger(ctx) {
    const accounts = [
      {
        ID: "user1",
        PK: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      },
    ];

    for (const account of accounts) {
      account.docType = "account";
      await ctx.stub.putState(
        account.ID,
        Buffer.from(stringify(sortKeysRecursive(account))),
      );
    }
  }

  // CreateUser issues a new user to the world state with given details.
  async CreateUser(ctx, id, pk) {
    const exists = await this.UserExists(ctx, id);
    if (exists) {
      throw new Error(`The asset ${id} already exists`);
    }

    const account = {
      ID: id,
      PK: pk,
    };
    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    await ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(account))),
    );
    return JSON.stringify(account);
  }

  // FoundUser returns the user stored in the world state with given id.
  async FoundUser(ctx, id) {
    const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`The user ${id} does not exist`);
    }
    return assetJSON.toString();
  }

  // AddUser updates an existing user in the world state with provided parameters.
  async AddUser(ctx, id, pk) {
    const exists = await this.UserExists(ctx, id);
    if (!exists) {
      throw new Error(`The user ${id} does not exist`);
    }

    // overwriting original asset with new asset
    const updatedUser = {
      ID: id,
      PK: pk,
    };
    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    return ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(updatedUser))),
    );
  }

  // UserExists returns true when asset with given ID exists in world state.
  async UserExists(ctx, id) {
    const assetJSON = await ctx.stub.getState(id);
    return assetJSON && assetJSON.length > 0;
  }

  // DeleteUser deletes an given asset from the world state.
  async DeleteUser(ctx, id) {
    const exists = await this.UserExists(ctx, id);
    if (!exists) {
      throw new Error(`The user ${id} does not exist`);
    }
    return ctx.stub.deleteState(id);
  }

  // GetAllUser returns all assets found in the world state.
  async GetAllUser(ctx) {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange("", "");
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8",
      );
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }

  //InsertData, add data in Autonomi
  async InsertData(ctx, id, message) {
    let accountJson = await this.FoundUser(ctx, id);
    const account = JSON.parse(accountJson);
    try {
      let res = await axios.post("http://172.17.0.1:3000/insertData", {
        pk: account.PK,
        content: message,
      });
      return JSON.stringify(res.data.address);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  //RetrieveData, retrieve data from Autonomi
  async RetrieveData(ctx, addr) {
    try {
      let res = await axios.post("http://172.17.0.1:3000/retrieveData", {
        addr: addr,
      });
      console.log(res);
      return JSON.stringify(res.data.message);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  //InsertFile, insert files in Autonomi
  async InsertFile(ctx, id, path) {
    let accountJson = await this.FoundUser(ctx, id);
    const account = JSON.parse(accountJson);
    try {
      let res = await axios.post("http://172.17.0.1:3000/insertFile", {
        pk: account.PK,
        path: path,
      });
      console.log("address: ", res.data.address);
      return JSON.stringify(res.data.address);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  //RetrieveFile, retrieve file from Autonomi
  async RetrieveFile(ctx, addr, dest) {
    try {
      let res = await axios.post("http://172.17.0.1:3000/retrieveFile", {
        addr: addr,
        dest: dest,
      });
      console.log(res);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

module.exports = AutonomiWasm;

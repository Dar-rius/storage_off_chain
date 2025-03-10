"use strict";
const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require("sinon-chai");
const expect = chai.expect;

const { Context } = require("fabric-contract-api");
const { ChaincodeStub } = require("fabric-shim");

const AutonomiWasm = require("../lib/autonomiWasm.js");

let assert = sinon.assert;
chai.use(sinonChai);

describe("Basic Tests", () => {
  let transactionContext, chaincodeStub, account;
  beforeEach(() => {
    transactionContext = new Context();

    chaincodeStub = sinon.createStubInstance(ChaincodeStub);
    transactionContext.setChaincodeStub(chaincodeStub);

    chaincodeStub.putState.callsFake((key, value) => {
      if (!chaincodeStub.states) {
        chaincodeStub.states = {};
      }
      chaincodeStub.states[key] = value;
    });

    chaincodeStub.getState.callsFake(async (key) => {
      let ret;
      if (chaincodeStub.states) {
        ret = chaincodeStub.states[key];
      }
      return Promise.resolve(ret);
    });

    chaincodeStub.deleteState.callsFake(async (key) => {
      if (chaincodeStub.states) {
        delete chaincodeStub.states[key];
      }
      return Promise.resolve(key);
    });

    chaincodeStub.getStateByRange.callsFake(async () => {
      function* internalGetStateByRange() {
        if (chaincodeStub.states) {
          // Shallow copy
          const copied = Object.assign({}, chaincodeStub.states);

          for (let key in copied) {
            yield { value: copied[key] };
          }
        }
      }

      return Promise.resolve(internalGetStateByRange());
    });

    account = {
      ID: "user1",
      PK: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    };
  });

  describe("Test InitLedger", () => {
    it("should return error on InitLedger", async () => {
      chaincodeStub.putState.rejects("failed inserting key");
      let autonomiWasm = new AutonomiWasm();
      try {
        await autonomiWasm.InitLedger(transactionContext);
        assert.fail("InitLedger should have failed");
      } catch (err) {
        expect(err.name).to.equal("failed inserting key");
      }
    });

    it("should return success on InitLedger", async () => {
      let autonomiWasm = new AutonomiWasm();
      await autonomiWasm.InitLedger(transactionContext);
      let ret = JSON.parse((await chaincodeStub.getState("user1")).toString());
      expect(ret).to.eql(Object.assign({ docType: "account" }, account));
    });
  });

  describe("Test Insert and retrieve data in autonomi", () => {
    it("should insert data & return  data decrypted", async () => {
      let autonomiWasm = new AutonomiWasm();
      await autonomiWasm.InitLedger(transactionContext);
      let addr = await autonomiWasm.InsertData(
        transactionContext,
        account.ID,
        "test1",
      );
      let ret = await autonomiWasm.RetrieveData(transactionContext, addr);
      expect(ret).to.equal('"test1"');
    });
  });

  describe("Test Insert and retrieve file in autonomi", () => {
    it("should insert file & return file decrypted", async () => {
      let autonomiWasm = new AutonomiWasm();
      await autonomiWasm.InitLedger(transactionContext);
      let addr = await autonomiWasm.InsertFile(
        transactionContext,
        account.ID,
        "./files/test.txt",
      );
      console.log(addr);
      let ret = await autonomiWasm.RetrieveFile(
        transactionContext,
        addr,
        "./files/results/text.txt",
      );
      expect(ret).to.equal('"File downloaded"');
    });
  });
});

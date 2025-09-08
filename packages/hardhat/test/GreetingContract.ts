import { expect } from "chai";
import { ethers } from "hardhat";
import { GreetingContract } from "../typechain-types";

describe("GreetingContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let greetingContract: GreetingContract;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const yourContractFactory = await ethers.getContractFactory("GreetingContract");
    greetingContract = (await yourContractFactory.deploy(owner.address)) as GreetingContract;
    await greetingContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have the right message on deploy", async function () {
      expect(await greetingContract.greeting()).to.equal("Greeting from EM");
    });

    it("Should allow setting a new message", async function () {
      const newGreeting = "Hello, It's Me";

      await greetingContract.setGreeting(newGreeting);
      expect(await greetingContract.greeting()).to.equal(newGreeting);
    });
  });
});

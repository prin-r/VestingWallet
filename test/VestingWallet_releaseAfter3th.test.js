const {
  BN,
  expectRevert,
  time,
  balance
} = require("openzeppelin-test-helpers");

const { expect } = require("chai");

require("chai").should();

const VestingWallet = artifacts.require("VestingWallet");
const BandToken = artifacts.require("BandToken");

contract("VestingWallet - release after 3th", ([owner, alice, bob]) => {
  beforeEach(async () => {
    this.band = await BandToken.new({ from: owner });
    await this.band.mint(owner, 10000000, { from: owner });

    this.vw = await VestingWallet.new(
      this.band.address,
      alice,
      1,
      1576569600,
      1000000,
      [1584432000, 1592380800, 1600329600],
      { from: owner }
    );
    await this.band.transfer(this.vw.address, 1000000, { from: owner });
  });

  context("Basics", () => {
    it("should not be able to release tokens if in cliff period", async () => {
      console.log("current time = ", (await time.latest()).toString());
      await expectRevert.unspecified(this.vw.release({ from: alice }));
    });
    it("should be able to withdraw every things after 3th", async () => {
      (await this.band.balanceOf(alice)).toString().should.eq("0");
      (await this.band.balanceOf(this.vw.address))
        .toString()
        .should.eq("1000000");

      await time.increaseTo(1600329600 + 1);
      await this.vw.release({ from: alice });

      (await this.band.balanceOf(alice)).toString().should.eq("1000000");
      (await this.band.balanceOf(this.vw.address)).toString().should.eq("0");
    });
  });
});

const {
  BN,
  expectRevert,
  time,
  balance
} = require("openzeppelin-test-helpers");

const { expect } = require("chai");

require("chai").should();

const VWFactory = artifacts.require("VWFactory");
const VestingWallet = artifacts.require("VestingWallet");
const BandToken = artifacts.require("BandToken");

contract("VWFactory", ([owner, alice, bob]) => {
  beforeEach(async () => {
    this.band = await BandToken.new({ from: owner });
    await this.band.mint(owner, 10000000, { from: owner });

    this.vwf = await VWFactory.new(this.band.address, { from: owner });
  });

  context("Basics 1", () => {
    it("token address should be BAND", async () => {
      (await this.vwf.token()).toString().should.eq(this.band.address);
    });
    it("should not be able to transfer if not approve", async () => {
      await expectRevert.unspecified(
        this.vwf.createVestingWallet(alice, "1000000", { from: owner })
      );
    });
  });

  context("Basics 2", () => {
    beforeEach(async () => {
      await this.band.approve(this.vwf.address, "10000000", { from: owner });
      await this.vwf.createVestingWallet(alice, "1000000", { from: owner });
      this.wallet1 = await VestingWallet.at(await this.vwf.wallets(0));
    });
    it("should have 1000000 BAND in the created wallet", async () => {
      (await this.band.balanceOf(this.wallet1.address))
        .toString()
        .should.eq("1000000");
    });
    it("should be destructible if revoked by owner", async () => {
      (await this.band.balanceOf(owner)).toString().should.eq("9000000");
      await expectRevert.unspecified(this.wallet1.revoke({ from: alice }));
      await expectRevert.unspecified(this.wallet1.revoke({ from: bob }));
      await this.wallet1.revoke({ from: owner });
      (await this.band.balanceOf(owner)).toString().should.eq("10000000");
      (await this.band.balanceOf(this.wallet1.address))
        .toString()
        .should.eq("0");
    });
  });
});

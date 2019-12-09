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

contract("VestingWallet - release every days", ([owner, alice, bob]) => {
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
    it("should be able to release tokens if cliff period has ended", async () => {
      (await this.band.balanceOf(alice)).toString().should.eq("0");

      await time.increaseTo(1576569600);
      await expectRevert.unspecified(this.vw.release({ from: alice }));
      await time.increaseTo(1576569601);
      await this.vw.release({ from: alice });

      (await this.band.balanceOf(alice)).toString().should.eq("250000");
      console.log("alice recieve 250000");

      for (let t = 1576569600 + 86400; t < 1584432000; t += 86400) {
        await time.increaseTo(t);
        await expectRevert.unspecified(this.vw.release({ from: alice }));
      }
      await time.increaseTo(1584432000);
      await this.vw.release({ from: alice });
      (await this.band.balanceOf(alice)).toString().should.eq("500000");
      console.log("alice recieve 500000");

      for (let t = 1584432000 + 86400; t < 1592380800; t += 86400) {
        await time.increaseTo(t);
        await expectRevert.unspecified(this.vw.release({ from: alice }));
      }
      await time.increaseTo(1592380800);
      await this.vw.release({ from: alice });
      (await this.band.balanceOf(alice)).toString().should.eq("750000");
      console.log("alice recieve 750000");

      for (let t = 1592380800 + 86400; t < 1600329600; t += 86400) {
        await time.increaseTo(t);
        await expectRevert.unspecified(this.vw.release({ from: alice }));
      }
      await time.increaseTo(1600329600);
      await this.vw.release({ from: alice });
      (await this.band.balanceOf(alice)).toString().should.eq("1000000");
      console.log("alice recieve 1000000");

      (await this.band.balanceOf(this.vw.address)).toString().should.eq("0");
    });
  });
});

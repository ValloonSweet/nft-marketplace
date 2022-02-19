const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Market", function () {
  it("Should create and execute market sales", async function () {
    const Market = await ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftContractAddress = nft.address;

    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();
    const auctionPrice = ethers.utils.parseUnits("100", 'ether');

    await nft.createToken("mytokenLocation2.com");
    await nft.createToken("mytokenLocation3.com");

    await market.createMarketItem(nftContractAddress, 1, auctionPrice, {value: listingPrice});
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, {value: listingPrice});

    const [_, buyerAddress] = await ethers.getSigners();

    // created
    const createdItems = await market.fetchItemsCreated();
    console.log('created items', createdItems);

    // buy item
    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, {value: auctionPrice});

    // get unsold items
    const items = await market.fetchMarketItems();
    console.log('items: ', items);

    const myItems = await market.connect(buyerAddress).fetchMyNFTs();
    console.log('my nfts', myItems);
  });
});

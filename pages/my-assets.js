import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import axios from 'axios';
import Web3Modal from 'web3modal';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

import {
    nftmarketaddress, nftaddress
} from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

export default function MyAssets() {
    const [nfts, setNfts] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');

    useEffect(() => {
        loadNFTs();
    }, []);

    async function loadNFTs() {
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);

        const data = await marketContract.fetchMyNFTs();
        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId);
            const meta = await axios.get(tokenUri);
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
            }
            return item;
        }));
        console.log(items);
        setNfts(items);
        setLoadingState('loaded');
    }

    if(loadingState === 'loaded' && !nfts.length) return (
        <h1 className='px-20 py-10 text-3xl'>No Assets Owned</h1>
    )

    return (
        <div className='flex justify-center'>
          <div className='px-4' style={{maxWidth: '1600px'}}>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
              {
                nfts.map((nft, i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                        <img src={nft.image} />
                        <div className='p-4'>
                            <p className='text-2xl font-bold text-black'>Price - {nft.price}</p>
                        </div>
                    </div>
                ))
              }
            </div>
          </div>
        </div>
    )
}
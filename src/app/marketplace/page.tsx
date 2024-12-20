"use client";

import React, { useEffect, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { PublicKey } from "@solana/web3.js";
import { getNFTDetail, getNFTList } from "@/utils/nftMarket";
import Card from "@/components/Card";
import Skeleton from "@/components/Skeleton";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import FilterSection from "../components/FilterSection";

export interface NFTDetail {
  name: string;
  symbol: string;
  image?: string;
  group?: string;
  mint: string;
  seller: string;
  price: string;
  listing: string;
  collection?: string;
  designer?: string;
  year?: string;
}

const trimAddress = (address: string) =>
  `${address.slice(0, 4)}...${address.slice(-4)}`;

const Closet: React.FC = () => {
  const [assets, setAssets] = useState<NFTDetail[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<NFTDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [priceRange, setPriceRange] = useState<[number, number]>([
    0, 10000000000,
  ]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedDesigners, setSelectedDesigners] = useState<string[]>([]);

  const [uniqueCollections, setUniqueCollections] = useState<string[]>([]);
  const [uniqueYears, setUniqueYears] = useState<string[]>([]);
  const [uniqueDesigners, setUniqueDesigners] = useState<string[]>([]);

  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { data: session } = useSession();

  useEffect(() => {
    fetchNFTs();
  }, [wallet]);

  useEffect(() => {
    applyFilters();
  }, [priceRange, selectedCollections, selectedYears, selectedDesigners]);

  const fetchNFTs = async () => {
    setIsLoading(true);
    try {
      const provider = new AnchorProvider(connection, wallet as Wallet, {});
      const listings = await getNFTList(provider, connection);

      const promises = listings
        .filter((list) => list.isActive)
        .map((list) => {
          const mint = new PublicKey(list.mint);
          return getNFTDetail(
            mint,
            connection,
            list.seller,
            list.price,
            list.pubkey
          );
        });

      const detailedListings = await Promise.all(promises);
      setAssets(detailedListings);
      setFilteredAssets(detailedListings);
      setUniqueCollections(
        Array.from(
          new Set(
            detailedListings
              .map((asset) => asset.collection)
              .filter((collection): collection is string =>
                Boolean(collection && collection.trim())
              )
          )
        )
      );

      setUniqueYears(
        Array.from(
          new Set(
            detailedListings
              .map((asset) => asset.year)
              .filter((year): year is string => Boolean(year && year.trim()))
          )
        )
      );

      setUniqueDesigners(
        Array.from(
          new Set(
            detailedListings
              .map((asset) => asset.designer)
              .filter((designer): designer is string =>
                Boolean(designer && designer.trim())
              )
          )
        )
      );
    } catch (error) {
      console.error(error);
      setError("Failed to fetch assets.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assets];

    if (priceRange[0] !== null && priceRange[1] !== null) {
      filtered = filtered.filter(
        (asset) =>
          (!priceRange[0] || parseFloat(asset.price) >= priceRange[0]) &&
          (!priceRange[1] || parseFloat(asset.price) <= priceRange[1])
      );
    }

    // Filter by selected collections
    if (selectedCollections.length > 0) {
      filtered = filtered.filter((asset) =>
        selectedCollections.includes(asset.collection || "")
      );
    }

    // Filter by selected years
    if (selectedYears.length > 0) {
      filtered = filtered.filter((asset) =>
        selectedYears.includes(asset.year || "")
      );
    }

    // Filter by selected designers
    if (selectedDesigners.length > 0) {
      filtered = filtered.filter((asset) =>
        selectedDesigners.includes(asset.designer || "")
      );
    }

    setFilteredAssets(filtered);
  };

  const toggleSelection = (
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setSelected((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((item) => item !== value)
        : [...prevSelected, value]
    );
  };

  return (
    <div className="p-4 pt-20 bg-white dark:bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center text-black dark:text-white">
        NFTs on Sale
      </h1>
      {session && (
        <div className="mb-4 text-center text-xl font-medium text-green-600 dark:text-green-400">
          Welcome back, {session.user?.name || "User"}!
        </div>
      )}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
        {/* Filters Section */}
        <div className="mb-8 lg:mb-0 lg:col-span-1">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Filters
          </h2>
          <FilterSection
            label="Collection"
            options={uniqueCollections}
            selected={selectedCollections}
            setSelected={setSelectedCollections}
          />

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price Range
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([parseFloat(e.target.value), priceRange[1]])
                }
                placeholder="Min"
                className="mt-1 block w-1/2 border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseFloat(e.target.value)])
                }
                placeholder="Max"
                className="mt-1 block w-1/2 border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>

          <FilterSection
            label="Year"
            options={uniqueYears}
            selected={selectedYears}
            setSelected={setSelectedYears}
          />

          <FilterSection
            label="Designer"
            options={uniqueDesigners}
            selected={selectedDesigners}
            setSelected={setSelectedDesigners}
          />
        </div>

        {/* Display NFTs */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index}>
                  <Skeleton className="h-64 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </div>
          ) : filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset: NFTDetail) => (
                <Card key={asset.mint}>
                  <div className="relative h-64 w-full">
                    {asset.image ? (
                      <img
                        src={asset.image}
                        alt={asset.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-bold">{asset.name}</h3>
                  <p className="text-gray-500">
                    Mint: {trimAddress(asset.mint)}
                  </p>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    Price: ${asset.price}
                  </p>
                  {asset.collection && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Collection: {asset.collection}
                    </p>
                  )}
                  {asset.year && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Year: {asset.year}
                    </p>
                  )}
                  {asset.designer && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Designer: {asset.designer}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <h2 className="text-2xl font-bold mb-4 text-center text-red-500 dark:text-yellow">
              No NFTs match your filters.
            </h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default Closet;

const { ethers } = require("hardhat");

async function main() {
  console.log("🚨 Starting Deployment: Proof-of-Location Mining for Disaster Response");
  console.log("=" * 70);

  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    const deployerBalance = await deployer.provider.getBalance(deployer.address);
    
    console.log("👤 Deploying from account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(deployerBalance), "CORE");
    console.log("🌐 Network: Core Testnet (Chain ID: 1114)");
    console.log("🔗 RPC URL: https://rpc.test2.btcs.network");
    
    // Check minimum balance requirement
    if (deployerBalance < ethers.parseEther("0.01")) {
      throw new Error("Insufficient balance for deployment. Need at least 0.01 CORE tokens.");
    }

    console.log("\n📦 Getting Contract Factory...");
    const DisasterResponseMining = await ethers.getContractFactory("DisasterResponseMining");
    
    console.log("🚀 Deploying DisasterResponseMining contract...");
    console.log("⏳ Please wait for deployment to complete...");
    
    // Deploy with gas estimation
    const estimatedGas = await DisasterResponseMining.getDeployTransaction().then(tx => 
      deployer.estimateGas(tx)
    );
    
    console.log("⛽ Estimated Gas:", estimatedGas.toString());
    
    const disasterResponseMining = await DisasterResponseMining.deploy({
      gasLimit: estimatedGas * 120n / 100n // Add 20% buffer
    });

    console.log("⏳ Waiting for deployment confirmation...");
    await disasterResponseMining.waitForDeployment();
    
    const contractAddress = await disasterResponseMining.getAddress();
    const deploymentTx = disasterResponseMining.deploymentTransaction();
    
    console.log("\n✅ CONTRACT DEPLOYED SUCCESSFULLY!");
    console.log("=" * 50);
    console.log("📍 Contract Address:", contractAddress);
    console.log("🔗 Transaction Hash:", deploymentTx.hash);
    console.log("⛽ Gas Used:", deploymentTx.gasLimit.toString());
    console.log("💰 Deployment Cost:", ethers.formatEther(deploymentTx.gasPrice * deploymentTx.gasLimit), "CORE");
    
    // Verify deployment by checking contract code
    const contractCode = await deployer.provider.getCode(contractAddress);
    if (contractCode === "0x") {
      throw new Error("Contract deployment failed - no code at address");
    }
    
    console.log("\n🔍 CONTRACT VERIFICATION");
    console.log("=" * 30);
    console.log("✅ Contract code confirmed at address");
    console.log("📏 Bytecode length:", contractCode.length, "characters");
    
    // Get initial contract state
    console.log("\n📊 INITIAL CONTRACT STATE");
    console.log("=" * 35);
    
    try {
      const owner = await disasterResponseMining.owner();
      const nextDisasterZoneId = await disasterResponseMining.nextDisasterZoneId();
      const nextProofId = await disasterResponseMining.nextProofId();
      const minStakeAmount = await disasterResponseMining.minStakeAmount();
      
      console.log("👑 Contract Owner:", owner);
      console.log("🆔 Next Disaster Zone ID:", nextDisasterZoneId.toString());
      console.log("🆔 Next Proof ID:", nextProofId.toString());
      console.log("💰 Minimum Stake Amount:", ethers.formatEther(minStakeAmount), "CORE");
      console.log("✅ Owner Verification:", owner.toLowerCase() === deployer.address.toLowerCase() ? "PASSED" : "FAILED");
      
    } catch (error) {
      console.log("⚠️  Could not fetch initial state:", error.message);
    }
    
    // Network information
    console.log("\n🌍 NETWORK INFORMATION");
    console.log("=" * 30);
    const network = await deployer.provider.getNetwork();
    const blockNumber = await deployer.provider.getBlockNumber();
    const gasPrice = await deployer.provider.getFeeData();
    
    console.log("🔗 Network Name:", network.name || "Core Testnet");
    console.log("🆔 Chain ID:", network.chainId.toString());
    console.log("📦 Block Number:", blockNumber);
    console.log("⛽ Current Gas Price:", ethers.formatUnits(gasPrice.gasPrice, "gwei"), "Gwei");
    
    // Core Blockchain Explorer Links
    console.log("\n🔍 BLOCKCHAIN EXPLORER");
    console.log("=" * 30);
    console.log("📄 Contract:", `https://scan.test2.btcs.network/address/${contractAddress}`);
    console.log("📄 Transaction:", `https://scan.test2.btcs.network/tx/${deploymentTx.hash}`);
    
    // Usage Instructions
    console.log("\n📖 NEXT STEPS");
    console.log("=" * 20);
    console.log("1. 🏥 Create disaster zones using createDisasterZone()");
    console.log("2. 👥 Allow responders to register using registerResponder()");
    console.log("3. ✅ Verify responders using verifyResponder()");
    console.log("4. 📍 Responders submit location proofs using submitLocationProof()");
    console.log("5. 💰 Responders claim rewards using claimRewards()");
    
    // Contract interaction examples
    console.log("\n💻 SAMPLE INTERACTIONS");
    console.log("=" * 30);
    console.log("// Create a disaster zone (owner only)");
    console.log(`await contract.createDisasterZone("Tokyo Earthquake", 35676000, 139650000, 5000, ethers.parseEther("0.01"), { value: ethers.parseEther("10") });`);
    console.log("\n// Register as responder");
    console.log(`await contract.registerResponder("QmHash123...", { value: ethers.parseEther("0.1") });`);
    console.log("\n// Submit location proof");
    console.log(`await contract.submitLocationProof(1, 35676000, 139650000);`);
    
    // Save deployment info to file
    const deploymentInfo = {
      contractName: "DisasterResponseMining",
      contractAddress: contractAddress,
      deploymentTransaction: deploymentTx.hash,
      deployer: deployer.address,
      network: "Core Testnet",
      chainId: 1114,
      blockNumber: blockNumber,
      timestamp: new Date().toISOString(),
      gasUsed: deploymentTx.gasLimit.toString(),
      gasPrice: deploymentTx.gasPrice.toString(),
      deploymentCost: ethers.formatEther(deploymentTx.gasPrice * deploymentTx.gasLimit)
    };
    
    const fs = require('fs');
    fs.writeFileSync(
      'deployment-info.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n💾 Deployment info saved to 'deployment-info.json'");
    console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("🚨 Ready to save lives and coordinate disaster response! 🚨");
    
  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error("Error:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.error("💡 Solution: Add more CORE tokens to your wallet");
      console.error("🔗 Get testnet tokens: https://scan.test2.btcs.network/faucet");
    }
    
    if (error.message.includes("nonce")) {
      console.error("💡 Solution: Reset your wallet nonce or wait for pending transactions");
    }
    
    process.exit(1);
  }
}

// Execute deployment
main()
  .then(() => {
    console.log("\n✅ Script execution completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script execution failed:");
    console.error(error);
    process.exit(1);
  });

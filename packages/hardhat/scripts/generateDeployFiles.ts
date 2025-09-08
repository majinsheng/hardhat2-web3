import fs from 'fs';
import path from 'path';

/**
 * Script to automatically generate deployment files for compiled contracts
 */
async function generateDeployFiles() {
  const artifactsDir = path.join(__dirname, '../artifacts/contracts');
  const deployDir = path.join(__dirname, '../deploy');
  
  // Ensure deploy directory exists
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir);
  }
  
  // Get all contract json files (skip debug files)
  const contractFiles: string[] = [];
  
  function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        getAllFiles(fullPath, arrayOfFiles);
      } else if (file.endsWith('.json') && !file.includes('.dbg.json')) {
        arrayOfFiles.push(fullPath);
      }
    });
    
    return arrayOfFiles;
  }
  
  // Get all contract files
  if (fs.existsSync(artifactsDir)) {
    getAllFiles(artifactsDir, contractFiles);
  } else {
    console.error('Artifacts directory not found. Please compile contracts first.');
    process.exit(1);
  }
  
  // Generate deploy files for each contract
  let deployFileIndex = 0;
  
  for (const contractFile of contractFiles) {
    const contractData = JSON.parse(fs.readFileSync(contractFile, 'utf8'));
    const contractName = contractData.contractName;
    
    // Skip interfaces and libraries - check for common naming patterns
    if (contractName.startsWith('I') || contractName.endsWith('Interface') || 
        contractName.endsWith('Library') || contractName.endsWith('Lib')) {
      continue;
    }
    
    // Check if deploy file already exists for this contract
    const existingFiles = fs.readdirSync(deployDir);
    const alreadyExists = existingFiles.some(file => 
      file.includes(`deploy_${contractName.toLowerCase()}`) || 
      file.includes(`${contractName}`)
    );
    
    if (alreadyExists) {
      console.log(`Deploy file for ${contractName} already exists, skipping.`);
      continue;
    }
    
    // Create deploy file content
    const paddedIndex = String(deployFileIndex).padStart(2, '0');
    const deployFileName = `${paddedIndex}_deploy_${contractName}.ts`;
    const deployFilePath = path.join(deployDir, deployFileName);
    
    const deployFileContent = `import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "${contractName}" using the deployer account
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deploy${contractName}: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("${contractName}", {
    from: deployer,
    // Update args as needed for your contract constructor
    args: [deployer],
    log: true,
    autoMine: true,
  });
};

export default deploy${contractName};

deploy${contractName}.tags = ["${contractName}"];
`;
    
    fs.writeFileSync(deployFilePath, deployFileContent);
    console.log(`Created deploy file: ${deployFileName}`);
    
    deployFileIndex++;
  }
  
  console.log('Deployment files generation complete!');
}

// Run the function
generateDeployFiles().catch(error => {
  console.error('Error generating deploy files:', error);
  process.exit(1);
});

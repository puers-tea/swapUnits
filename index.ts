/* eslint-disable @typescript-eslint/no-floating-promises */

import Web3 from 'web3';
import { Web3Account } from 'web3-eth-accounts';
import { Environment } from './types';

const createWeb3Instance = (nodeUrl: string): Web3 => {
  return new Web3(nodeUrl);
};

const createAccount = (web3: Web3, privateKey: string): Web3Account => {
  return web3.eth.accounts.privateKeyToAccount(privateKey);
};

const getBalance = async (web3: Web3, publicKey: string) => {
  const balance = await web3.eth.getBalance(publicKey);

  return web3.utils.fromWei(balance, 'ether');
};

const getEnvVariables = (): Environment => {
  return {
    nodeUrl: 'https://rpc-testnet.unit0.dev',
    privateKey: '0x4af2a8356fe94aa13d8cacb3a4ae58163bc906d50d7bd43cef7f75d978b6ca36',
    amount: 100000,
    txCount: 3000000, // кол-во транзакций, которые нужно сделать
  };
};

const sendTransaction = async (web3: Web3, env: Environment, account: Web3Account) => {
  const amount = web3.utils.toWei(env.amount, 'wei');
  // const gas = web3.utils.toWei(100000, 'Gwei');
  // const gasPrice = web3.utils.toWei(10, 'wei');
  // const gasLimit = web3.utils.toWei(200000, 'wei');
  // const maxFeePerGas = web3.utils.toWei(100000, 'wei');

  const signedTransaction = await account.signTransaction({
    to: account.address,
    from: account.address,
    value: amount,
    // gas,
    // gasPrice,
    // gasLimit,
    gas: web3.utils.toHex(31000),
    maxFeePerGas: '0x59682F00', // '0x59682F00', // 1.5 Gwei
    maxPriorityFeePerGas: '0x1DCD6500', // '0x1DCD6500', // .5 Gwei
    type: '0x2',
  });

  console.log('\t Signed - [x]');

  await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

  console.log(`\t Sended - [x]`);
};

const main = async () => {
  const env = getEnvVariables();

  const web3 = createWeb3Instance(env.nodeUrl);

  const account = createAccount(web3, env.privateKey);

  console.time('work');
  for (let i = 0; i < env.txCount; i += 1) {
    const balance = await getBalance(web3, account.address);
    console.log(`TX: ${i}. Balance: ${balance}`);

    try {
      await sendTransaction(web3, env, account);
    } catch (e) {
      console.log('Error');
      i -= 1;

      console.log(e);
      // Отдыхаем 5с в случае ошибки
      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });
    }
  }

  console.timeEnd('work');
};

main();

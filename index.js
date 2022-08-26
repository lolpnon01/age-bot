import { config } from 'dotenv'
import express from 'express'
import Web3 from 'web3'
import HDWalletProvider from '@truffle/hdwallet-provider'
import {abi} from "./abi/abi.js"
import {abiPool} from "./abi/abiPool.js"
import {contractAddress,poolAddress} from "./abi/index.js";

const node = "https://bsc-dataseed.binance.org/"

// PASTE HERE
const myAddress = ""
const myPrivateKey = ""

// If last user = this - no buyMiners()
const lastUser = "0xBcf0B018D94A08a97c48A16AE99a1C9eb778B234"

config()
const app = express()

const web3 = new Web3(new Web3.providers.HttpProvider(node))
let contractPool = new web3.eth.Contract(abiPool, poolAddress)
let contractMain = new web3.eth.Contract(abi, contractAddress)

const toWei = amount => Web3.utils.toWei(amount)

function getWeb3Provider() {
    return new HDWalletProvider({
        privateKeys: [myPrivateKey],
        providerOrUrl: 'https://bsc-dataseed.binance.org/',
        network_id: 56
    });
}

contractMain.setProvider(getWeb3Provider());

app.listen(3000, function(){
    console.log('listening on *:3000');

    let timer = setInterval(() => {

        console.log('hi')
        contractPool.methods.moment().call(function (err, res) {
            if (err) {
                console.log("An error occured", err)
                return
            }

            const currentTime = new Date().getTime();
            // Calculate distance
            const distance = (res * 1000 + 3600000) - currentTime;

            console.log(distance)

            if (distance > 0) {

                let minutes = Math.floor((distance / 1000 / 60) % 60);
                console.log(minutes)
                if (minutes < 15) {
                    contractPool.methods.lastUser().call(function (err, res) {
                        if (err) {
                            console.log("An error occured", err)
                            return
                        }

                        if (res === lastUser) {
                            console.log('Buy Miners wasnt called because of Last user')
                            return;
                        }

                        contractMain.methods
                            .buyMiners("0x28aCD726eaDe6Da7424b8BfdeB722d4Bc2b5a394", toWei('50'))
                            .send({
                                from: myAddress,
                            })
                            .then(r => console.log(r))
                            .catch( e => console.log(e))
                    })
                }
            } else {
                contractPool.methods.lastUser().call(function (err, res) {
                    if (err) {
                        console.log("An error occured", err)
                        return
                    }

                    if (res === lastUser) {
                        console.log('Buy Miners wasnt called because of Last user')
                        return;
                    }

                    contractMain.methods
                        .buyMiners("0x28aCD726eaDe6Da7424b8BfdeB722d4Bc2b5a394", toWei('50'))
                        .send({
                            from: myAddress,
                        })
                        .then(r => console.log(r))
                        .catch( e => console.log(e))
                })
            }
        })

        timer
    }, 3000);
});
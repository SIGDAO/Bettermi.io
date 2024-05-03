import * as React from 'react';
 import './myNftList.css'
 import { useSelector } from 'react-redux';
 import { accountId, accountPublicKey } from '../../redux/account';
 import { useState } from 'react';
 import { useEffect } from 'react';
 import { useAppSelector } from '../../redux/useLedger';
 import { selectWalletNodeHost } from '../../redux/useLedger';
 import { LedgerClientFactory } from '@signumjs/core';
 import { useContext } from 'react';
 import { AppContext } from '../../redux/useContext';
 import { P2PTransferNftToken } from '../../components/p2pTransferNftToken';
 import { useNavigate } from 'react-router-dom';
 import { CheckNftOwnerId } from '../../NftSystem/updateUserNftStorage';
 import { UpdateUserIcon } from '../../NftSystem/updateUserNftStorage';
import { selectCurrentUsername } from '../../redux/profile';
import { selectedNftInfo } from '../allNftList/indexAllNftList';
import IPFSImageComponent from '../../components/ipfsImgComponent';
import { convertWordToNumber } from '../../NftSystem/Reward/getRewardPercentage';
import { getApiUrls } from '../../components/constants/constant';

 interface MyNftProps {
    image:string;
    level:string;
    isOpenPopup: boolean;
    setIsOpenPopup: (isOpenPopup: boolean) => void;
     nftId:string;
     setSelectedAssetId:(nftId:string) => void;
    setLevel:(level:string) => void;
    isUpdatingDescription:boolean;
    setIsUpdatingDescription:(isUpdatingDescription:boolean) => void;
    isOtherUser:boolean;
    setOpenModel:(openModel:boolean) => void;
    setSelectedNft:(selectedNft:selectedNftInfo) => void;
 }


 const MyNft: React.FunctionComponent<MyNftProps> =  (props) => {
     const {image, level, isOpenPopup, setIsOpenPopup,nftId,setSelectedAssetId,setLevel,isUpdatingDescription,setIsUpdatingDescription,isOtherUser,setOpenModel,setSelectedNft} = props;
     const [loading, setLoading] = useState<boolean>(true);
     const [imgAddress, setImgAddress] = useState<string>("");
     const nodeHost = useSelector(selectWalletNodeHost);
     const ledger2 = LedgerClientFactory.createClient({nodeHost});
     const userAccountpublicKey:string = useSelector(accountPublicKey);
     const userAccountId:string = useSelector(accountId);
     const {appName,Wallet,Ledger} = useContext(AppContext);
     const [nftLevel,setNftLevel] = useState<string>("");
     const [nftNumber,setNftNumber] = useState<string>("");
     const [reward,setReward] = useState<string>("");
     const name = useAppSelector(selectCurrentUsername);
     useEffect(() => {
         //fetch(`https://aqua-petite-woodpecker-504.mypinata.cloud/ipfs/${image}?pinataGatewayToken=cL2awO7TOSq6inDgH6nQzP46A38FpRr1voSLTpo14pnO1E6snmmGfJNLZZ41x8h1`).then((res)=>{
          fetch(getApiUrls(image).imgAddress).then((res)=>{
             res.text().then((text)=>{
                 var nftInfo = JSON.parse(text);
                 let matches = nftInfo.name.match(/(\d+)/);
                 const nftNumber:string = matches[0].toString().padStart(8, '0');
                 setNftNumber(nftNumber);
                 if(nftInfo.description.includes("1") === true){
                  setNftLevel("1");
                 }
                 if(nftInfo.description.includes("2") === true){
                  setNftLevel("2");
                 }
                 if(nftInfo.description.includes("3") === true){
                  setNftLevel("3");
                 }
                 const level = convertWordToNumber(nftInfo.attributes[6].value);
                 console.log("level is",level);
                 if(isNaN(level) === false){
                   console.log((level/3).toString());
                  setReward(((level/3).toFixed(2)).toString());
                 }
                 else{
                   setReward("");
                 }
                 setImgAddress(nftInfo.media[0].social);
                 setLoading(false);
             }).catch((e:any) => {console.log(e);});

         }).catch((e:any) => {console.log(e);});

       }, [image]);
     const equipNft = async() => {
      try{
            const nftOwner = await CheckNftOwnerId(ledger2,nftId);
            if(nftOwner === userAccountId){
              await UpdateUserIcon(ledger2,imgAddress,nftId,userAccountId,userAccountpublicKey,Wallet,name);
              setIsUpdatingDescription(true);
            }
            else{
              alert("We are sorry, it seems like you still don't own this NFT, maybe wait for a few more minutes if you just received it revcently");
            }
          }
          catch(e){
            console.log(e);
          }
     };
     const transferToken = async() => {
      P2PTransferNftToken(Wallet,nodeHost,process.env.REACT_APP_NFT_DISTRIBUTOR,nftId,userAccountpublicKey);
     };
   return(
      <>
      {loading?(<div>loading</div>):(
          imgAddress === ""?(<div>loading</div>):(

                  <div className = "myNftList">
                    <IPFSImageComponent onClick = {
                      () =>{
                        setOpenModel(true);const nftInfo:selectedNftInfo={
                          imageUrl:imgAddress,
                          nftLevel:nftLevel,
                          nftPrice:"0",
                          nftReward:reward,
                          nftNumber:nftNumber?nftNumber:"-1",
                        }

                        setSelectedNft(nftInfo);
                      }
                      } className = "myNftImage" imgAddress = {imgAddress}></IPFSImageComponent>

                    <div className = "myNftDescription">
                    <div className = "myNftNumber">#{nftNumber}</div>
                      <div className = "myNftBar">
                        <div  className = "myNftLevel">
                          Lv{nftLevel}       
                          </div>
                          <div className = "myNftVerticalLine"></div>  
                          <div  className = "myNftListRewardPercentage">
                            Reward + {reward}%
                            </div>
                      </div>
                      <div className = "myNftPrice">
                        $0 SIGNA
                      </div>
                    </div>
                    <div className = "myNftBottom">
                    {isOtherUser === true?(
                      <>
                        <button className = "myNftButtonDisabled" onClick = {equipNft}>Available</button>
                        <img 
                          onClick={() => {
                            setIsOpenPopup((prev) => !prev);
                            setSelectedAssetId(nftId);

                            setLevel(nftLevel);
  
                          }} 
                          className = "myNftButtomArrowDisabled" 
                          src  = {`${process.env.PUBLIC_URL}/img/NftList/ic-send@1x.png`}
                        />
                        </>
                    ):(
                      <>
                          <button className = "myNftButton" onClick = {equipNft}>Available</button>
                          <img 
                            onClick={() => {
                              setIsOpenPopup((prev) => !prev);

                              setSelectedAssetId(nftId);
                              setLevel(nftLevel);

                            }} 
                            className = "myNftButtomArrow" 
                            src  = {`${process.env.PUBLIC_URL}/img/NftList/ic-send@1x.png`}
                          />
                        </>
                    )
                    }

                    </div>
                  </div>
          )
        )

      }
       </>
         );

     // return (
     //   <CenterLayout
     //     content={content}
     //     bgImg={false}
     //   />
     // );"{"version":1,"descriptor":"QmNhdiqCRXzoVm3pn5eaqvudAjbWsavwqi6a6Bs7ZL5WeE"}"
   };

   export default MyNft;
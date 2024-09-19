import * as React from "react";
import "./coupons.css";
import { CenterLayout } from "../../components/layout";
import { ShortTitleBar } from "../../components/titleBar";
import { Link } from "react-router-dom";
import { accountId } from "../../redux/account";
import { useDispatch, useSelector } from "react-redux";
import { TransferToken } from "../../components/transferToken";
import { Button } from "@mui/material";
import { walletNodeHost } from "../../redux/wallet";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { challengeList } from "../../data/challengeList";
import { CheckIsUserFirstDayOfRegistration } from "../../NftSystem/BMISelfieSystem";
import { selectWalletNodeHost } from "../../redux/useLedger";
import { LedgerClientFactory } from "@signumjs/core";
import { CountChallenges } from "../../NftSystem/Token/countChallenges";
import { findNFTLevel } from "../../NftSystem/FindNFTLevel";
import { checkUserLevel } from "../../NftSystem/UserLevel/checkUserLevel";
import { selectCurrentIsGuest } from "../../redux/profile";
import SigdaoIcon from "../../components/icon";
import MenuBar from "../../components/menuBar";
import { useLocation } from "react-router-dom";
import { useGetCouponDetailMutation, useGetUserMutation, useGetCouponsByUserMutation, useRefreshCouponCodeMutation, useGetAllCouponsMutation,usePostCouponsByFilteringMutation } from "../../redux/couponAPI";
import { couponSlice, selectCurrentCouponList, selectCurrentSelectedCoupon } from "../../redux/coupon";
interface ICouponsProps {}

const Coupons: React.FunctionComponent<ICouponsProps> = (props) => {
  // const title = "All Coupons";
  const userAccountId = useSelector(accountId);
  const nodeHost = useSelector(selectWalletNodeHost);
  const ledger2 = LedgerClientFactory.createClient({ nodeHost });
  const navigate = useNavigate();
  const [isOverDailyPlayTimesLimit, setisOverDailyPlayTimesLimit] = useState<boolean[]>([]);
  const [userChallengeTimes, setUserChallengeTimes] = useState<number[]>([]);
  const [allowedChallengeList, setAllowedChallengeList] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [title , setTitle]  = useState<string>("All Coupons");
  // const [Timedifference, setTimedifference] = useState<string[]>([]);
  const BMIMachineCodeHashId = process.env.REACT_APP_BMI_MACHINE_CODE_HASH!.replace(/['"]+/g, "");
  const nftDistributor = process.env.REACT_APP_NFT_DISTRIBUTOR!;
  const updated = useRef(false);
  let isNew = false;
  const isGuest = useSelector(selectCurrentIsGuest);
  const location = useLocation();

  const dispatch = useDispatch();
  const [getCouponsByUser, { isSuccess: isGetCouponsByUser, error: getCouponError }] = useGetCouponsByUserMutation();
  const [getAllCoupons, {isSuccess: isGetAllCoupons, error: getAllCouponsError}] = useGetAllCouponsMutation();
  const [postCouponsByFiltering, {isSuccess: isGetFilteredCoupons, error: getFilteredCouponsError}] = usePostCouponsByFilteringMutation();
  const couponList = useSelector(selectCurrentCouponList);

  // to use CountChallenges to count
  // display as 0/3 as text

  //Anderson's code starts here
  // const NewUserCheck = async () => {
  //   const isUpdated = await CheckIsUserFirstDayOfRegistration(ledger2, userAccountId, BMIMachineCodeHashId);

  //   return isUpdated === true
  // };

  // useEffect(() => {

  //   NewUserCheck();
  // })
   useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paramValue = searchParams.get("apiKey");
    const paramMerchants = searchParams.get("merchant")
    const paramIndustries = searchParams.get("industry")
    const paramOrder = searchParams.get("order")
    console.log("paramValue:", paramValue);
    console.log("paramMerchants:", paramMerchants);
    if (paramMerchants !== null) {
    console.log("num:", paramMerchants.split("^^^").length)
    }
    console.log("paramIndustries:", paramIndustries);
    console.log("paramOrder: ", paramOrder)
    if (paramIndustries === null && paramOrder === null && ((paramMerchants !== null) && paramMerchants.split("^^^").length === 1)){
      setTitle(paramMerchants);
    }else if ( paramIndustries !== null || paramOrder !== null  || paramMerchants !== null){
      setTitle("Filtered result")
    }
    //case without login
    //if no any filtering options are selected, the page will fetch all the data.
    if (paramMerchants === null && paramIndustries === null && paramOrder === null){
      //get all coupon 
      getAllCoupons("")
      .then((res) => {
        console.log(res);
        if ("data" in res) {
          const couponList = res.data;
          dispatch(couponSlice.actions.setCouponList(couponList));
          console.log(couponList);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    }else{
      postCouponsByFiltering({paramOrder, paramMerchants,paramIndustries})
      .then((res) => {
        console.log(res);
        if ("data" in res) {
          const couponList = res.data;
          dispatch(couponSlice.actions.setCouponList(couponList));
          console.log(couponList);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    }
    
    if (searchParams.size > 0 && paramValue !==null) {
      // login({ email: localStorage.getItem("email") || "", href: window.location.href })
      //   .then((res) => {
      //     if ("data" in res) {
      //       dispatch(couponUserSlice.actions.setCredentials({ email: localStorage.getItem("email") || "", token: res.data.accessToken || "" }));
      //     }
      //     const newUrl = `${location.pathname}`;
      //     window.history.replaceState({}, "", newUrl);
      //     setCouponUser(localStorage.getItem("email"));
      //   })
      //   .catch((err) => {
         
      //     console.log(err);
      //   });
    }
    // getUser(loginedEmail)
    // .then((res) => {
    //   console.log(res);
    //   if ("data" in res) {
    //     // const couponList = res.data;
    //     dispatch(couponUserSlice.actions.setCredentials({ email: res.data.email || "", token: res.data.accessToken || "" }));
    //   }
    // })
    // .catch((err) => {
    //   console.log(err);
    // });
  }, [location.search]);
  // copied code, may delete after checking 
  useEffect(() => {
    const handleBeforeUnload = () => {
      updated.current = false; // Reset the value before navigating away
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  //Anderson's code ends here

  useEffect(() => {
    const checkTimeSlot = async () => {
      // guest user
      if (isGuest) {
        setIsLoading(false);
        setAllowedChallengeList([true, true, true, false, false, false, false, false, false]);

        return;
      }

      //Anderson's code starts here
      //findNFTLevel(ledger2,userAccountId);
      if (updated.current === false) {
        updated.current = true;
        //isNew = await NewUserCheck(); //Run a check on whether there is a new user. Also, the handleBeforeUnload function ensures the check only run once
        const userLevel = await checkUserLevel(ledger2, userAccountId);

        const playedChallenge = await CountChallenges(userAccountId, ledger2);
        const allowedChallenge: boolean[] = [];
        for (var i = 0; i < 9; i++) {
          if (i >= userLevel * 3) {
            allowedChallenge.push(false);
            //playedChallenge[i] = 3;
          } else {
            allowedChallenge.push(true);
          }
        } //Temporarily disable the remaining six challenges

        setAllowedChallengeList(allowedChallenge);

        setUserChallengeTimes(playedChallenge);

        setisOverDailyPlayTimesLimit(
          playedChallenge.map((numChallengesPlayed) => {
            if (numChallengesPlayed >= 2) {
              return false;
            }
            return true;
          }),
        );
        setIsLoading(false);

        //Anderson's code ends here

        //Anderson disabled this 2023/11/12
        // setisOverDailyPlayTimesLimit(
        //   challengeList.map((mission) => {
        //     if(mission.title === "1. Hello Bae !" /*&& isNew === true*/){

        //       return true;
        //     }
        //     const { timeslot } = mission;
        //     const isInSlot = timeslot.some(
        //       (slot) => currentTime >= getTimeInMinutes(slot.startingTime) && currentTime <= getTimeInMinutes(slot.endTime)
        //     );

        //     return isInSlot;
        //   })
        // );

        //Anderson disabled till here
        // setTimedifference(
        //   challengeList.map((mission) => {
        //     const { timeslot } = mission;
        //     const timedifferentInFormat = timeslot.map((slot) => {
        //       const time = slot.startingTime.split(":").map((ele) => parseInt(ele));
        //       const formatTime = time[0] * 60 * 60 + time[1] * 60;
        //       const timeDiff = formatTime - currentTimeInSecond;

        //       if (timeDiff < 0) {
        //         return timeDiff + 24 * 60 * 60;
        //       }

        //       return timeDiff;
        //     });
        //     let filteredtimedifferentInFormat = timedifferentInFormat.filter((date) => {

        //       return date > 0;
        //     });

        //     filteredtimedifferentInFormat.sort((a, b) => a - b);

        //     const hours = Math.floor(filteredtimedifferentInFormat[0] / 3600)
        //       .toString()
        //       .padStart(2, "0");
        //     const minutes = Math.floor((filteredtimedifferentInFormat[0] % 3600) / 60)
        //       .toString()
        //       .padStart(2, "0");
        //     const seconds = (filteredtimedifferentInFormat[0] % 60).toString().padStart(2, "0");

        //     // const hours = Math.floor(timedifferentInFormat[0] / (1000 * 60 * 60));
        //     // const minutes = Math.floor((timedifferentInFormat[0] / (1000 * 60)) % 60);
        //     // const seconds = Math.floor((timedifferentInFormat[0] / 1000) % 60);

        //     return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        //     // return timedifferentInFormat;
        //     // return '';
        //   })
        // );
      }
    };

    const interval = setInterval(checkTimeSlot, 2000);

    return () => clearInterval(interval);

    // setisOverDailyPlayTimesLimit(
    //   challengeList.map((mission) => {
    //     return true;
    //   })
    // );
  }, []);

  const getTimeInMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const challengeTimesDisplay = (index): JSX.Element => {
    if (!allowedChallengeList[index]) {
      return <div className="score-bar_2-inactive inter-semi-bold-white-15px">LOCKED</div>;
    }

    if (isOverDailyPlayTimesLimit[index]) {
      return (
        <div className="score-bar_2">
          <div className="starting inter-semi-bold-white-15px">{`${userChallengeTimes[index]}/2`}</div>
        </div>
      );
    }

    if (isGuest) {
      return <div className="score-bar_2-completed inter-semi-bold-white-15px">STARTING</div>;
    }


    return (
      <div className="score-bar_2-completed inter-semi-bold-white-15px">
        {/* {mission.timeslot[0].startingTime} */}
        COMPLETED
        {/* {Timedifference[index]} */}
      </div>
    );
  };

  // const checkTimeSlot = () => {
  //   const currentTime = new Date().toLocaleTimeString([], {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //   });

  //   for (const mission of challengeList) {
  //     for (const time of mission.timeslot) {
  //       if (currentTime >= time.startingTime && currentTime <= time.endTime) {
  //         setisOverDailyPlayTimesLimit(true);
  //         return;
  //       }
  //     }
  //   }

  //   setisOverDailyPlayTimesLimit(false);
  // };

  // useEffect(() => {
  //   const interval = setInterval(checkTimeSlot, 1000); // Check every second

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

  const content: JSX.Element = (
    <div className="screen">
      <div className="bettermidapp-challenges-1">
        <ShortTitleBar title={title} aiCoach={true} setting={true} customiseBackButton={true} customiseBackButtonLink="/marketplace" isCouponSystem={true}/>
        <img className="photo-7K5ObS" src="img/coupons/coupons_landing.jpg" alt="Photo" />
        <div className="challenges-card-7K5ObS">
          <img className="layer-nLfc9z" src="img/missionChallenge/layer-1@1x.png" alt="Layer" />
          <div className="scroll-group-nLfc9z">
            <div className="challenge-cards-QuyfDF">
              {isLoading ? (
                <div></div>
              ) : (
                <div> 
              {couponList.map((coupon, index) => {
        return (
          <div key={index}>
            {/* <p style={{ color: "white" }}>{coupon.c_name}</p>
            <p style={{ color: "white" }}>{coupon.c_description}</p> */}
                       <button className="couponsContainer" onClick={() => navigate("/couponDetail/XYZ456")}>
              <img className="couponImage" src={`${process.env.PUBLIC_URL}/img/coupons/demo_coupons.jpg`} alt="Card_bg"></img>
              <div className="descriptionChallengeCompleted">
                <div className="descriptionTitleChallengeCompleted">{coupon.c_name}</div>
                {/* <div className="couponExpiryDate">使用期xx/xx/xxxx</div> */}
                   <div className="couponExpiryDate">{coupon.c_description}</div>
                <div className="descriptionBottomBodyChallengeCompleted">
                  {/* <SigdaoIcon width="16px" height="16px" /> */}
                  {/* <div className="sigdaoChallengeCompleted">+5.25 ~ 15.75</div> */}
                  {/* <img className="arrowChallengeCompleted" src={`${process.env.PUBLIC_URL}/img/allMission/ic-chevron-right-24px-1@1x.png`}></img> */}
                </div>
              </div>
            </button>
          </div>
        );
      })}
            {/* //non dymatic demo */}
            <button className="couponsContainer" onClick={() => navigate("/couponDetail/BTS789")}>
              <img className="couponImage" src={`${process.env.PUBLIC_URL}/img/coupons/demo_coupons.jpg`} alt="Card_bg"></img>
              <div className="descriptionChallengeCompleted">
                <div className="descriptionTitleChallengeCompleted">迎新獎賞：$50現金優惠劵</div>
                <div className="couponExpiryDate">使用期xx/xx/xxxx</div>
                <div className="descriptionBottomBodyChallengeCompleted">
                  {/* <SigdaoIcon width="16px" height="16px" /> */}
                  {/* <div className="sigdaoChallengeCompleted">+5.25 ~ 15.75</div> */}
                  {/* <img className="arrowChallengeCompleted" src={`${process.env.PUBLIC_URL}/img/allMission/ic-chevron-right-24px-1@1x.png`}></img> */}
                </div>
              </div>
            </button>
            <button className="couponsContainer" onClick={() => navigate("/couponDetail/NTD0001")}>
              <img className="couponImage" src={`${process.env.PUBLIC_URL}/img/coupons/demo_coupons.jpg`} alt="Card_bg"></img>
              <div className="descriptionChallengeCompleted">
                <div className="descriptionTitleChallengeCompleted">迎新獎賞：xxx現金優惠劵</div>
                <div className="couponExpiryDate">使用期xx/xx/xxxx</div>
                <div className="descriptionBottomBodyChallengeCompleted">
                  {/* <SigdaoIcon width="16px" height="16px" /> */}
                  {/* <div className="sigdaoChallengeCompleted">+5.25 ~ 15.75</div> */}
                  {/* <img className="arrowChallengeCompleted" src={`${process.env.PUBLIC_URL}/img/allMission/ic-chevron-right-24px-1@1x.png`}></img> */}
                </div>
              </div>
            </button>
            <button className="couponsContainer" onClick={() => navigate("/couponDetail/BEST10GUY")}>
              <img className="couponImage" src={`${process.env.PUBLIC_URL}/img/coupons/demo_coupons.jpg`} alt="Card_bg"></img>
              <div className="descriptionChallengeCompleted">
                <div className="descriptionTitleChallengeCompleted">迎新獎賞：免費飲品</div>
                <div className="couponExpiryDate">使用期xx/xx/xxxx</div>
                <div className="descriptionBottomBodyChallengeCompleted">
                  {/* <SigdaoIcon width="16px" height="16px" /> */}
                  {/* <div className="sigdaoChallengeCompleted">+5.25 ~ 15.75</div> */}
                  {/* <img className="arrowChallengeCompleted" src={`${process.env.PUBLIC_URL}/img/allMission/ic-chevron-right-24px-1@1x.png`}></img> */}
                </div>
              </div>
            </button>
            </div>
                // challengeList.map((mission, index) => {
                //   return (
                //     <Button
                //       onClick={async () => {
                //         // go to challengeCountdown page
                //         if (allowedChallengeList[index] && isGuest) {
                //           navigate(`/challengeCountdown/${index + 1}`);
                //           return;
                //         }
                //         const numChallengesPlayed = await CountChallenges(userAccountId, ledger2);

                //         if (isOverDailyPlayTimesLimit[index] && allowedChallengeList[index] === true && numChallengesPlayed[index] < 3) {
                //           navigate(`/challengeCountdown/${index + 1}`);
                //         }
                //       }}
                //       className="challenge-cards-Ic1qil"
                //     >
                //       <>
                //         {challengeTimesDisplay(index)}
                //         <div
                //           className="inner-mission-container"
                //           // style={isOverDailyPlayTimesLimit[index] ? {opacity: '1'} : {opacity: '0.4'}}
                //         >
                //           <div className="mission-graph">
                //             <img className="mission-gif" src={mission.missionImgPath} alt="" />
                //           </div>
                //           <div className="mission-detail">
                //             <div className="mission-topic inter-semi-bold-white-18px">{mission.title}</div>
                //             <div className="mission-time-bodyPart-container">
                //               <div className="mission-time-container">
                //                 <img className="ic_time" src="img/missionChallenge/ic-time@1x.png" alt="ic_time" />
                //                 <p className="inter-semi-bold-cadet-blue-14px">{mission.duration}</p>
                //               </div>
                //               <div className="mission-bodyPart-container">
                //                 <img className="ic_-body" src="img/missionChallenge/ic-body@1x.png" alt="ic_Body" />
                //                 <p className="inter-semi-bold-cadet-blue-14px">{mission.bodyPart}</p>
                //               </div>
                //             </div>
                //             <div className="mission-level-and-reward">
                //               <div className="mission-level inter-semi-bold-keppel-15px">LV {mission.nftLevel}</div>
                //               <div className="level-and-sigdao-separate-line"></div>
                //               <div className="mission-reward-container">
                //                 <SigdaoIcon width="17px" height="17px" />
                //                 <p className="inter-semi-bold-keppel-14px">{mission.sigdao}</p>
                //               </div>
                //               <img className="mission-bar-arrow-right" src="img/missionChallenge/ic-chevron-right-24px-1@1x.png" alt="" />
                //             </div>
                //           </div>
                //         </div>
                //       </>
                //     </Button>
                //   );
                // })
              )}
            </div>
          </div>
        </div>
        <MenuBar />
      </div>
    </div>
  );

  return <CenterLayout content={content} bgImg={false} />;
};

export default Coupons;

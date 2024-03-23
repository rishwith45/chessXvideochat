import Chessboard from "chessboardjsx";
import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { initSocket } from "./socket";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import mic from "./mic.svg";
import micoff from "./mic-off.svg";
import videoimg from "./video (1).svg";
import videoimgoff from "./off-video.png";
import exit from "./close (1).png";
const Board = ({ userName, setUserName }) => {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [position, setPosition] = useState("start");
  const [game] = useState(new Chess());
  const effectaRan = useRef(false);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const [socket, setSocket] = useState(null);
  const palying = useRef(null);
  const makingOffer = useRef(false);
  const [room, setRoom] = useState(false);
  const ignoreOffer = useRef(false);
  const [opponentName, setOpponentName] = useState(null);
  const [orient, setOrient] = useState("white");
  const [drag, setdrag] = useState(true);
  const [wonCand, setWoncand] = useState(null);
  const stream = useRef(null);
  const [Swidth, setSwidth] = useState(500);
  const pc = useRef(null);
  const [left, setleft] = useState(false);
  const [micc, setmic] = useState(true);
  const [vid, setvid] = useState(true);
  useEffect(() => {
    if (!userName) {
      navigate("/");
    }
    const init = async () => {
      effectaRan.current = true;

      socketRef.current = await initSocket();
      socketRef.current.on("update", (tomove) => {
        game.move(tomove);
        const played = game.fen();
        setPosition(played);
        setdrag(true);
      });
      socketRef.current.on("roomCreated", () => {
        setRoom(true);
        socketRef.current.emit("myname", userName);
      });
      socketRef.current.on("opponent-name", (name) => {
        setOpponentName(name);
      });
      socketRef.current.on("orient", () => {
        console.log("orinetkdsm");
        setOrient("black");
        setdrag(false);
      });
      socketRef.current.on("left-game", () => {
        setleft(true);
      });
      socketRef.current.on("woncand", (name) => {
        setWoncand(name);
      });
      setSocket(socketRef.current);
    };
    if (!effectaRan.current && userName) {
      init();
    }
  }, [socketRef.current]);

  useEffect(() => {
    const rtc = async () => {
      const config = {
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
              "stun:stun3.l.google.com:19302",
              "stun:stun4.l.google.com:19302",
            ],
          },
        ],
      };
      pc.current = new RTCPeerConnection(config);

      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      const videotrack = stream.current.getVideoTracks()[0];
      stream.current.getTracks().forEach((track) => {
        pc.current.addTrack(track, stream.current);
      });
      localVideo.current.srcObject = new MediaStream([videotrack]);
      localVideo.current.play();
      palying.current = true;
      let videoplaying = false;
      pc.current.ontrack = ({ track, streams }) => {
        if (!videoplaying) {
          videoplaying = true;
          remoteVideo.current.srcObject = streams[0];
          remoteVideo.current.play();
        }
      };
      pc.current.onnegotiationneeded = async () => {
        try {
          makingOffer.current = true;
          await pc.current.setLocalDescription();
          socketRef.current.emit("send-offer", {
            description: pc.current.localDescription,
          });
        } catch (err) {
          console.error(err);
        } finally {
          makingOffer.current = false;
        }
      };
      pc.current.onicecandidate = ({ candidate }) => {
        socketRef.current.emit("sending-ice", { candidate });
      };
      socketRef.current.on("from-server", async ({ data }) => {
        const description = data.description;
        const candidate = data;

        try {
          if (description) {
            const offerCollision =
              description.type === "offer" && makingOffer.current;

            ignoreOffer.current = offerCollision;
            if (ignoreOffer.current) {
              return;
            }

            await pc.current.setRemoteDescription(description);
            if (description.type === "offer") {
              await pc.current.setLocalDescription();
              socketRef.current.emit("send-offer", {
                description: pc.current.localDescription,
              });
            }
          } else if (candidate) {
            try {
              await pc.current.addIceCandidate(data.candidate.candidate);
            } catch (err) {
              if (!ignoreOffer) {
                throw err;
              }
            }
          }
        } catch (err) {
          console.error(err);
        }
      });
    };
    if (socket && room) rtc();
  }, [socket, room]);

  const onDrop = (move) => {
    try {
      const tomove = {
        from: move.sourceSquare,
        to: move.targetSquare,
        promotion: "q",
      };
      game.move(tomove);

      if (game.isGameOver()) {
        setWoncand(userName);
        socketRef.current.emit("game-over", userName);
      }
      const played = game.fen();
      setPosition(played);
      setdrag(false);
      socketRef.current.emit("played", tomove);
    } catch (error) {}
  };
  const calcWidth = (par) => {
    let newWidth;
    if (par.screenWidth > par.screenHeight) {
      newWidth = par.screenHeight - 160;
    } else {
      newWidth = par.screenWidth - (15 / 100) * par.screenWidth;
    }
    setSwidth(newWidth);
  };
  const mictoggle = () => {
    if (stream.current) {
      stream.current.getAudioTracks().forEach((track) => {
        if (track.enabled) {
          track.enabled = false;
          setmic(false);
        } else {
          track.enabled = true;
          setmic(true);
        }
      });
    }
  };
  const videotoggle = () => {
    if (stream.current) {
      stream.current.getVideoTracks().forEach((track) => {
        if (track.enabled) {
          track.enabled = false;
          setvid(false);
        } else {
          track.enabled = true;
          setvid(true);
        }
      });
    }
  };
  const playagain = () => {
    if (orient == "black") {
      setOrient("white");
    } else {
      setOrient("black");
    }
    setWoncand(false);
    setPosition("start");
  };
  const close = () => {
    if (stream.current) {
      stream.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    if (pc.current) {
      pc.current.close();
      pc.current.onicecandidate = null;
      pc.current.oniceconnectionstatechange = null;
      pc.current.ontrack = null;
      pc.current = null;
    }
    navigate("/");
  };

  return (
    <>
      <div className="box">
        {(wonCand || left) && (
          <div className="gameover">
            {left && <h1>player left</h1>}
            {wonCand && <h1>{wonCand} WONN!!</h1>}
            <div className="popup">
              {wonCand && (
                <button type="button" onClick={playagain}>
                  close
                </button>
              )}
              {left && (
                <button type="button" onClick={close}>
                  Exit
                </button>
              )}
            </div>
          </div>
        )}
        <div className="sidebox">
          <video className="remote-video" ref={remoteVideo}></video>
          <video className="user-video" ref={localVideo}></video>
        </div>
        <div className="controls">
          {micc ? (
            <img src={mic} onClick={mictoggle} />
          ) : (
            <img src={micoff} onClick={mictoggle} />
          )}
          {vid ? (
            <img src={videoimg} onClick={videotoggle} />
          ) : (
            <img src={videoimgoff} onClick={videotoggle} />
          )}
          <img src={exit} onClick={close} />
        </div>
        <div className="board">
          {opponentName ? <h1>{opponentName}</h1> : <h1>waiting..</h1>}
          <Chessboard
            className="chessboard"
            position={position}
            onDrop={onDrop}
            orientation={orient}
            draggable={drag}
            calcWidth={calcWidth}
            width={Swidth}
          ></Chessboard>
          <h1>{userName}</h1>
        </div>
      </div>
    </>
  );
};
export default Board;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HeaderMain, FormRoom, ContentMessenage } from "../../components";
import "./Room.scss";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { apiConversation, apiNotification } from "../../services";
import { toast } from "react-toastify";

let socket;
let seeMore = 20;
export default function Room() {
  const reduxUserData = useSelector((state) => state.reduxUserData);

  const [messenages, setMessages] = useState([]);
  const [detailRoom, setDetailRoom] = useState({});
  const [isTyping, setIsTying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const params = useParams();
  // const ENDPOIN = "http://localhost:3003/api/chat";
  const token = localStorage.getItem("token");

  useEffect(() => {
    socket = io("/chat", {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    });
    if (params.id) {
      socket.emit("join", { ...params });
      apiConversation
        .getAllMessOfConversation(params.id, { q: seeMore })
        .then((res) => setMessages(res));
    }
    return () => {
      socket.off();
    };
  }, [params]);

  useEffect(() => {
    socket.on("mess", (mess) => {
      setMessages([...messenages, mess]);
    });
  }, [messenages]);

  useEffect(() => {
    apiConversation
      .getDetailTheater(params.id)
      .then((res) => setDetailRoom(res))
      .catch((err) => console.log(err));
  }, [params.id]);

  useEffect(() => {
    socket.on("typeStatus", (mess) => {
      if (reduxUserData.data.id !== mess.userId) {
        setIsTying(mess.statusTyping);
      }
    });
  }, []);

  const handleSendMess = (e, valueMess, setValueMess) => {
    e.preventDefault();
    socket.emit("sendMess", {
      userId: reduxUserData.data.id,
      content: valueMess,
      theaterId: params.id,
    });

    socket.emit("typing", {
      userId: reduxUserData.data.id,
      statusTyping: false,
      theaterId: params.id,
    });

    const dataSendNotify = {
      userIdRevice:
        reduxUserData.data.id === detailRoom.userId
          ? detailRoom.userId2
          : detailRoom.userId,
      content: valueMess,
      userIdSender:
        reduxUserData.data.id === detailRoom.userId
          ? detailRoom.userId
          : detailRoom.userId2,
    };
    apiNotification
      .postSendNotification(dataSendNotify)
      .then((res) => setValueMess(""))
      .catch((err) => console.log(err));
  };

  const handleTypingMes = (value) => {
    if (value) {
      socket.emit("typing", {
        userId: reduxUserData.data.id,
        statusTyping: true,
        theaterId: params.id,
      });
    } else {
      socket.emit("typing", {
        userId: reduxUserData.data.id,
        statusTyping: false,
        theaterId: params.id,
      });
    }
  };

  useEffect(() => {
    if (document.hasFocus) {
      console.log("focus in ReactJS");
    }
  }, [params]);

  const handleSeeMore = () => {
    setIsLoading(true);
    seeMore = seeMore + 20;
    apiConversation
      .getAllMessOfConversation(params.id, { q: seeMore })
      .then((res) => {
        setIsLoading(false);
        setMessages([...res, ...messenages]);
      })
      .catch((err) => {
        setIsLoading(false);
        toast.error(err.response.data.message);
      });
  };

  return (
    <div className="room">
      <div className="room__header">
        <HeaderMain detailRoom={detailRoom} />
      </div>

      <ContentMessenage
        messenages={messenages}
        userId={reduxUserData.data.id}
        handleSeeMore={handleSeeMore}
        isLoading={isLoading}
      />
      {isTyping && <span className="room__typing">Typing...</span>}
      <div className="room__form">
        <FormRoom
          handleSendMess={handleSendMess}
          handleTypingMes={handleTypingMes}
        />
      </div>
    </div>
  );
}

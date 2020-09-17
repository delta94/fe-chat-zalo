import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HeaderRoom, FormRoom, ContentMessenage } from "../../components";
import "./Room.scss";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { apiConversation } from "../../services";

let socket;
export default function Room() {
  const [messenages, setMessages] = useState([]);
  const reduxUserData = useSelector((state) => state.reduxUserData);
  const params = useParams();
  const ENDPOIN = "http://localhost:3000/";

  useEffect(() => {
    socket = io(ENDPOIN);
    socket.emit("join", { ...params });
    apiConversation
      .getAllMessOfConversation(params.id)
      .then((res) => setMessages(res));
    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, [ENDPOIN, params]);

  useEffect(() => {
    socket.on("mess", (mess) => {
      console.log(mess);
      setMessages([...messenages, mess]);
    });
  }, [messenages]);

  const handleSendMess = (values, resetForm) => {
    socket.emit("sendMess", {
      userId: reduxUserData.data.id,
      content: values.mes,
      theaterId: params,
    });
    resetForm();
  };

  return (
    <div className="room">
      <div className="room__header">
        <HeaderRoom />
      </div>
      <div className="room__content">
        <ContentMessenage
          messenages={messenages}
          userId={reduxUserData.data.id}
        />
      </div>
      <div className="room__form">
        <FormRoom handleSendMess={handleSendMess} />
      </div>
    </div>
  );
}

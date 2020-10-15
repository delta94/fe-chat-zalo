import React, { useEffect, useState } from "react";
import "./ListConversation.scss";
import HeaderList from "../Common/HeaderList/HeaderList";
import Avatar from "../Common/Avatar/Avatar";
import { useDispatch, useSelector } from "react-redux";
import { doGetConversationOfUser, doDeleteTheater } from "../../redux/actions";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import { X } from "react-feather";

export default function ListConversation() {
  const [isShowDelete, setIsShowDetele] = useState(false);
  const [index, setIndex] = useState(-1);

  const reduxConversation = useSelector((state) => state.reduxConversation);
  const reduxDeleteTheater = useSelector((state) => state.reduxDeleteTheater);
  const reduxUserData = useSelector((state) => state.reduxUserData);

  const dispatch = useDispatch();
  useEffect(() => {
    if (reduxUserData.data.id) {
      dispatch(doGetConversationOfUser(reduxUserData.data.id));
    }
  }, [
    reduxUserData.data.id,
    dispatch,
    reduxUserData.type,
    reduxUserData,
    reduxDeleteTheater,
  ]);
  const handleMouseEnter = (i) => {
    setIsShowDetele(true);
    setIndex(i);
  };
  const hanleMouseLeave = (i) => {
    setIsShowDetele(false);
    setIndex(i);
  };
  const handleDeleteTheater = () => {
    dispatch(doDeleteTheater(reduxUserData.data.id));
  };
  return (
    <div className="conversation">
      <HeaderList title={`Conversation (${reduxConversation.length})`} />
      {reduxConversation.map((item, i) => {
        return (
          <Link to={`/room/${item.id}`} className="conversation__link" key={i}>
            <div
              className="conversation__container"
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={() => hanleMouseLeave(i)}
            >
              {isShowDelete && index === i ? (
                <X
                  className="conversation__icon"
                  size={15}
                  onClick={handleDeleteTheater}
                />
              ) : null}

              <div className="conversation__content">
                <Avatar
                  backgroundImage={
                    reduxUserData.data.id === item.user.id
                      ? item.user2.urlAvatar
                      : item.user.urlAvatar
                  }
                  className="conversation__img"
                  showStatus={true}
                  status={
                    reduxUserData.data.id === item.user.id
                      ? item.user2.status
                      : item.user.status
                  }
                />

                <div className="conversation__main">
                  <p className="conversation__name">
                    {reduxUserData.data.id === item.user.id
                      ? item.user2.name
                      : item.user.name}
                  </p>
                  {item.message[0] ? (
                    <span className="conversation__mess">
                      {reduxUserData.data.id === item.message[0].userId
                        ? `You: ${item.message[0].content}`
                        : `${item.user.name}: ${item.message[0].content}`}
                    </span>
                  ) : (
                    <span className="conversation__mess">No messages</span>
                  )}
                </div>
              </div>
              {item.message[0] ? (
                <Moment format="DD/MM/YYYY" className="conversation__time">
                  <span>{item.message[0].createAt}</span>
                </Moment>
              ) : (
                <span className="conversation__time">No time</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

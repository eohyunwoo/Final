import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../../css/FriendManageCss/MessagePopup.css'; // CSS 파일 경로

const MessagePopup = ({ friendId, friendName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const popupRef = useRef(null);
  const messagesEndRef = useRef(null); // 메시지 끝에 대한 참조 추가
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user.userId;

        // 메시지 불러오기
        const response = await axios.get('http://localhost:9999/private-chat/conversation', {
          params: { userId1: userId, userId2: friendId }
        });
        setMessages(response.data);
      } catch (error) {
        console.error("메시지 로딩 중 오류 발생", error);
        alert('메시지를 로딩하는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [friendId]);

  // 메시지가 업데이트될 때 스크롤을 맨 아래로 이동시키는 useEffect 훅
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return; // 빈 메시지 전송 방지

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user.userId;

      // 메시지 전송
      await axios.post('http://localhost:9999/private-chat/send', null, {
        params: {
          senderId: userId,
          receiverId: friendId,
          messageContent: messageContent
        }
      });

      // 메시지 전송 후 새로고침
      setMessageContent('');
      const response = await axios.get('http://localhost:9999/private-chat/conversation', {
        params: { userId1: userId, userId2: friendId }
      });
      setMessages(response.data);
    } catch (error) {
      console.error("메시지 전송 중 오류 발생", error);
      alert('메시지를 전송하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 드래그 기능 추가
  const handleMouseDown = (e) => {
    if (popupRef.current) {
      setDragging(true);
      setOffset({
        x: e.clientX - popupRef.current.getBoundingClientRect().left,
        y: e.clientY - popupRef.current.getBoundingClientRect().top
      });
    }
  };

  // 마우스 이동 시 처리
  const handleMouseMove = (e) => {
    if (dragging && popupRef.current) {
      const x = e.clientX - offset.x;
      const y = e.clientY - offset.y;
      popupRef.current.style.left = `${x}px`;
      popupRef.current.style.top = `${y}px`;
    }
    if (resizing && popupRef.current) {
      const height = e.clientY - popupRef.current.getBoundingClientRect().top;
      popupRef.current.style.height = `${height}px`;
    }
  };

  // 마우스 버튼을 떼었을 때 처리
  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  useEffect(() => {
    // 이벤트 리스너 추가
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, resizing]);

  // 크기 조절 핸들 마우스 다운 시 처리
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    setResizing(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 기본 엔터키 동작 방지
      handleSendMessage();
    }
  };

  const formatDate = (date) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleTimeString([], options);
  };

  return (
    <div className="message-popup" ref={popupRef}>
      <div className="message-popup-header" onMouseDown={handleMouseDown}>
        <h2>{friendName}님과의 대화</h2>
        <button className="message-popup-close-btn" onClick={onClose}>닫기</button>
      </div>
      <div className="message-popup-body">
        {loading ? <p>로딩 중...</p> : (
          <div className="message-popup-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-popup-message ${msg.senderId === JSON.parse(localStorage.getItem('user')).userId ? 'message-sent' : 'message-received'}`}>
                <div className="message-content">{msg.messageContent}</div>
                <div className="message-time">{formatDate(msg.messageDate)}</div>
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* 메시지 끝에 대한 참조 추가 */}
          </div>
        )}
      </div>
      <div className="message-popup-footer">
        <input 
          type="text" 
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={handleKeyDown} // 엔터키 입력 감지
          placeholder="메시지를 입력하세요..."
        />
        <button 
          onClick={handleSendMessage}
          disabled={!messageContent.trim()} // 메시지가 빈 경우 비활성화
        >
          전송
        </button>
      </div>
      <div className="message-popup-resizer" onMouseDown={handleResizeMouseDown} />
    </div>
  );
};

export default MessagePopup;

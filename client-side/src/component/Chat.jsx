import React, { useState, useEffect, useCallback, useContext } from 'react'
import '../assets/chat.css'
import { Avatar, IconButton, Input } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import MicIcon from '@mui/icons-material/Mic';
import io from 'socket.io-client';
import ReactDOMServer from 'react-dom/server';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DataContext from '../DataContext';



export default function Chat({ setChatIconClicked, userName, ischatIconClicked, roomID, chatName, }) {
  const { privateChatData, setPrivateChatData, setPrivateNewMsgRec, setPrivateNewMsg } = useContext(DataContext);

  const form = document.getElementById('send-container')
  const messageInput = document.getElementById('message-input')
  const chatHeaderInfo = document.querySelector('.chat_headerInfo')
  const messageContainer = document.querySelector('.message-container');

  /////////////////////emoji picker////////////////////////////
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [recipientsActive, setRecipientsActive] = useState()
  const [state, setState] = useState(false)
  const [privateChatInit,
    setPrivateChatInit] = useState({
      userName: userName,
      recipientName: ''
    })


  var audio = new Audio('ting.mp3');

  const socket = io('http://localhost:3000');



  const someOnesOnline = (message) => {
    const messageElement = document.createElement('code');
    messageElement.innerText = message && message;
    chatHeaderInfo.append(messageElement)
    setTimeout(() => {
      chatHeaderInfo.removeChild(messageElement)
    }, 3000)
  }

  const someOnesOffline = (message) => {
    const messageElement = document.createElement('code');
    messageElement.innerText = message && message;
    chatHeaderInfo.append(messageElement)
    setTimeout(() => {
      chatHeaderInfo.removeChild(messageElement)
    }, 3000)
  }

  const recievedChat = (data, message, name, time) => {
    // console.log('message :', message)
    // console.log('name :', name)
    // console.log('time :', time)

    data.type && console.log('This is a one-to-one message', data.message.message);
    data.type && setPrivateNewMsg((prev) => {
      return [...prev, data]
    });
    data.type && console.log('one-to-one data:', data);

    const messageHtmlRecieve = `
    <p class="chat_message">
      <span class="chat_name">${name}</span>
      <span class='chatMore'>${ReactDOMServer.renderToString(<ExpandMoreIcon />)}</span>
      <span class="chat">${message?.message}</span>
      <span class="chat_timestamp">${time}</span>
    </p>
  `;

    messageContainer.innerHTML += messageHtmlRecieve;
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  const sendChat = (message, name, time) => {
    console.log('hitttt')

    const messageHtmlSend = `
    <p class="chat_message chat_receiver">
    <span class="chat_name">${name}</span>
    <span class='chatMore'>${ReactDOMServer.renderToString(<ExpandMoreIcon />)}</span>
    <span class="chat">${message}</span>
    <span class="chat_timestamp">${time}</span>
    <span class="tick">
      ${ReactDOMServer.renderToString(<DoneAllIcon />)}
    </span>
  </p>
`;

    messageContainer.innerHTML += messageHtmlSend;
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  useEffect(() => {

    socket.emit('new-user-online', userName);

    socket.on('user-online', name => {
      someOnesOnline(`${name} is online!`)

      ///////////////store uers in array to identify////////////////

      if (!recipientsActive?.includes(name)) {
        setRecipientsActive((prevUsers) => {
          if (Array.isArray(prevUsers)) {
            return [...prevUsers, name];
          } else {
            return [name];
          }
        });
      }
    })

    socket.on('receive', data => {
      console.log('dataReceived........: ', data)
      recievedChat(data, data.message, data.name, data.time)
    })

    ///////////////////////////////////////////////////////
    socket.on('createdRoomPrivate', (data) => {
      setPrivateNewMsg((prev) => {
        if (prev.some((item) => item.privateRoomID === data.privateRoomID)) {
          return prev; // Skip adding the data if it already exists in the array
        }
        return [...prev, data]; // Add the new data object to the array
      });

      // Perform actions for the user who requested to create the room
    });


    socket.on('joinedRoomPrivate', (data) => {
      console.log('Joined room with ID.......:', data);
      setPrivateNewMsgRec((prev) => {
        if (prev.some((item) => item.privateRoomID === data.privateRoomID)) {
          return prev; // Skip adding the data if it already exists in the array
        }
        return [...prev, data]; // Add the new data object to the array
      });
      // Perform actions for the other user who joined the room
    });


    socket.on('userLeftRoom', name => {
      console.log('name of the user who left a room', name)
      someOnesOffline(`${name.name} is offline!`)

    })



    return () => {
      socket.disconnect();
    };
  }, [socket, userName, someOnesOnline, recievedChat, ischatIconClicked]);



  useEffect(() => {
    state && socket.emit('createRoomPrivate', { userName, recipientName: privateChatInit?.recipientName })


    if (ischatIconClicked) {
      console.log('ischatIconClicked......', ischatIconClicked)
      const name = prompt(`Enter a recipient names from active recipients: ${recipientsActive}`);
      const recipientName = name && name.trim(); // Trim whitespace from the entered ID

      if (recipientsActive?.includes(recipientName)) {
        setPrivateChatInit((prev) => {
          return { ...prev, recipientName: recipientName };
        });

        setState(true)

        setTimeout(() => {
          setState(false)
        }, 2000)

        // console.log(' if roomID from handleSubmit.....', roomID)
        // console.log('matched recipientName from handleSubmit....', recipientName)
        // console.log('userName who is creating a room', userName)
      }

      else {
        alert('Recipient name not found!')

      }
      setChatIconClicked(false)


    } else {
      setChatIconClicked(false)
    }

  }, [socket, ischatIconClicked])


  const handleSubmit = (e) => {
    e.preventDefault();
    const message = messageInput.value;
    const timestamp = new Date().toUTCString();

    // if (roomID === 'chat1') {
    //   const name = prompt(`Enter a recipient names from active recipients: ${recipientsActive}`);
    //   const recipientName = name && name.trim(); // Trim whitespace from the entered ID

    //   if (recipientsActive?.includes(recipientName)) {
    //     console.log(' if roomID from handleSubmit.....', roomID)
    //     console.log('matched recipientName from handleSubmit....', recipientName)
    //     sendChat(message, 'You', timestamp);

    //     // Client-side code
    //     socket.emit('send', { roomID, message, recipientName });
    //   }
    //   else {
    //     alert('Recipient name not found!')
    //   }

    // } else {
      console.log('roomID from handleSubmit.....', roomID)
      sendChat(message, 'You', timestamp);
      socket.emit('send', { roomID, message });
    // }
    messageInput.value = '';
  };


  useEffect(() => {
    roomID && socket.emit('joinRoom', roomID);
    if (messageContainer) {
      messageContainer.innerHTML = ''
    }

    return () => {
      socket.disconnect();
    }
  }, [socket, roomID, messageContainer])

  ///////////////file attachment/////////////////////////
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    console.log('file', file)

    // Emit a Socket.IO event to send the file
    // socket.emit('sendFile', file);
  };


  ////////////////////////emoji picker///////////////////////

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prevState) => !prevState);
  };

  const handleEmojiSelect = (emoji) => {
    setSelectedEmoji(emoji.event);
    console.log('selectedEmoji', selectedEmoji)
  };


  ////////////////////////////////////////

  return (
    <div className='chat'>
      <div className="chat_header">
        <IconButton>
          <Avatar />
        </IconButton>
        <div className="chat_headerInfo">
          <h3>{chatName}</h3>
          <p>Last seen at....</p>
        </div>
        <div className="chat_headerRight">
          <IconButton>
            <SearchIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </div>
      </div>
      <div className="message-container chat_body">
        {/* ///////////////////////recieved message/////////////// */}


        {/* <p className=' chat_message'>
          <span className='chat_name'>Randy</span>
          <span className='chat'>Hey, There!</span>
          <span className='chat_timestamp'>
            {new Date().toUTCString()}
          </span>
        </p> */}


        {/* //////////////////////////send message////////////////////////// */}

        {/* <p className='chat_message chat_reciever'>
          <span className='chat_name'>Brock</span>
          <span className='chat'>Hey,</span>
          <span className='chat_timestamp'>
            {new Date().toUTCString()}
          </span>
          <span className='tick'>
            <DoneAllIcon />
          </span>
        </p> */}
      </div>

      <div className="chat_footer">
        <IconButton onClick={toggleEmojiPicker}>
          <InsertEmoticonIcon />
        </IconButton>

        {showEmojiPicker && (
          //   <Picker data={data} onSelect={handleEmojiSelect} showPreview={false} style={{ position: 'absolute', bottom: '80px', right: '16px' }} />
          <div style={{ position: 'absolute', bottom: '80px', zIndex: '3', left: '30rem' }}><Picker data={data} onEmojiSelect={console.log} onSelect={handleEmojiSelect} /></div>
        )}
        <IconButton>
          <label style={{ cursor: 'pointer' }} htmlFor="file-input">
            <AttachFileIcon type='file' />
          </label>
        </IconButton>
        <form id='send-container' onSubmit={handleSubmit}>
          <input type="file" id="file-input" style={{ display: 'none' }} onChange={handleFileSelect} />
          <input type="text" id='message-input' placeholder='Type a message' />
          <button id='send-btn' type='submit'> send a message</button>
        </form>
        <IconButton>
          <MicIcon />
        </IconButton>
      </div>


    </div>
  )
}

import React, { useEffect, useState } from 'react'
import '../assets/sidebar.css'
import { Avatar, IconButton, Popper, Box, Button, Menu, MenuItem } from '@mui/material';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import MessageIcon from '@mui/icons-material/Message';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import SidebarChat from './SidebarChat';
import GroupsIcon from '@mui/icons-material/Groups';
import { useAuth0 } from "@auth0/auth0-react";
import ReactDOMServer from 'react-dom/server';
import ReactDOM from 'react-dom'


export default function Sidebar({ setUserName, setRoomID, setChatName, privateNewMsg }) {

  ///////////////////login authentication////////////////////
  const { loginWithRedirect } = useAuth0();
  const { logout } = useAuth0();
  const [components, setComponents] = useState('');

  const { user, isAuthenticated, isLoading } = useAuth0();

  if (!isLoading) {
    setUserName(user?.nickname)
  }

  ////////////////////////////////////////////////////////

  function handleClickChat(roomId, chatName) {
    console.log('clicked a chat sidebar')
    setRoomID(roomId)
    setChatName(chatName)
  }


  ///////////////new message recieved/////////////////


  // useEffect(() => {
  //   // const chatListContainer = document.getElementById('newPrivateChats');
  //   // console.log('privateNewMsg', privateNewMsg);

  //   // if (privateNewMsg) {
  //   //   const newElement = `
  //   //     ${ReactDOMServer.renderToString(
  //   //       <SidebarChat
  //   //         onClick={() => handleClickChat(privateNewMsg?.name, privateNewMsg?.name)}
  //   //         groupName={privateNewMsg?.name}
  //   //         lastmsg={privateNewMsg?.message.message}
  //   //       />
  //   //     )}
  //   //   `;
  //   //   chatListContainer.insertAdjacentHTML('afterBegin', newElement);
  //   // }
  //   setComponents([...components, privateNewMsg])


  // }, [privateNewMsg]);

  useEffect(() => {

    privateNewMsg
    console.log('privateNewMsg', privateNewMsg)

  }, [privateNewMsg]);





  ///////////////////////////////////////////////////


  ///////////////////////////////////////////////////////

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  /////////////////////////////////////////////////////

  return (
    <div className='sidebar'>
      <div className="sidebar_header">

        <IconButton
          id="basic-button"
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          <Avatar src={isAuthenticated ? user.picture : ''} />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {isAuthenticated ? <>
            <MenuItem onClick={handleClose}>Hi, {user.nickname}</MenuItem>
            <MenuItem onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>LogOut</MenuItem></> :
            <MenuItem onClick={() => loginWithRedirect()}>LogIn</MenuItem>
          }

        </Menu>

        <div className="sidebar_headerRight">
          {/* <IconButton>
            <DonutLargeIcon />
          </IconButton> */}
          <IconButton>
            <GroupsIcon fontSize='medium' />
          </IconButton>
          <IconButton>
            <MessageIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </div>
      </div>

      <div className="sidebar_search">
        <div className="sidebar_searchContainer">
          <SearchIcon />
          <input type="text" placeholder='Enter name or start new chat' />
        </div>
      </div>
      <div id='newPrivateChats' className="sidebarChats">
        {Array.isArray(privateNewMsg) &&
          privateNewMsg.map((item, i) => {
            console.log('item....', item);
            return (
              <SidebarChat
                onClick={() => handleClickChat(item?.name, item?.name)}
                groupName={item?.name}
                lastmsg={item?.message?.message}
              />
            );
          })
        }

        <SidebarChat
          onClick={() => handleClickChat('chat1', 'chat 1')}
          groupName={'chat 1'}
          lastmsg={'chat 1 last message'}
        />
        <SidebarChat
          onClick={() => handleClickChat('chatGroup1', 'Group 1')}
          groupName={'Group 1'}
          lastmsg={'group 1 last message'}
        />
        <SidebarChat
          onClick={() => handleClickChat('chatGroup2', 'Group 2')}
          groupName={'Group 2'}
          lastmsg={'group 2 last message'}
        />
      </div>
    </div>
  )
}

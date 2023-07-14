import React, { useState } from 'react'
import Sidebar from './component/Sidebar';
import Chat from './component/Chat';
import './assets/app.css'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import { useAuth0 } from "@auth0/auth0-react";



function App() {
  const [userName, setUserName] = useState()
  const [roomID, setRoomID] = useState('chat1')
  const [chatName, setChatName] = useState('chat 1')
  const [open, setOpen] = React.useState(true);
  const handleClose = () => setOpen(false);
  const [privateNewMsg, setPrivateNewMsg] = useState('')
  const [ischatIconClicked, setChatIconClicked] = useState(false)


  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };


  ///////////////////login authentication///////////////////

  const { user, isAuthenticated, isLoading } = useAuth0();
  const { loginWithRedirect } = useAuth0()

  return (
    <>

      <div className='app'>
        <div className="app_body">

          {isLoading ? <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Wait a moment🥱....
            </Typography>
          </Box> :
          isAuthenticated ? <><Sidebar setChatIconClicked={setChatIconClicked} setUserName={setUserName} privateNewMsg={privateNewMsg} setRoomID={setRoomID} setChatName={setChatName} />
            <Chat setChatIconClicked={setChatIconClicked} ischatIconClicked={ischatIconClicked} setPrivateNewMsg={setPrivateNewMsg} userName={userName} roomID={roomID} chatName={chatName} /></> :
          <>
            <Modal
              open={open}
              onClose={handleClose}
            >
              <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Login To Chat Please!
                  <Button style={{ marginLeft: "20px" }} onClick={() => loginWithRedirect()} variant="contained">Login</Button>
                </Typography>
              </Box>
            </Modal>
          </>}
        </div>
      </div>
    </>
  )
}

export default App

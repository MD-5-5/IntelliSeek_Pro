import {Server} from 'socket.io'

let io;

export function iniSocket(httpServer){
    io = new Server(httpServer,{
        cors:{
            origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000"
    ],
            credentials: true,
        }
    })

    console.log("Socket.io server is running");
    
    io.on("connection", (socket) =>{
        console.log("A user connected" + socket.id);
        
    })
}


export function getID(){
    if(!io){
        throw new Error("Socket.io not initialised")
    }

}
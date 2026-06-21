const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado:', socket.id);

    // Identificar a los receptores y unirlos a una sala
    socket.on('soy_receptor', () => {
        socket.join('receptores');
    });

    // Retransmitir solo a los clientes en la sala 'receptores'
    socket.on('stream', (imageBase64) => {
        socket.to('receptores').emit('stream', imageBase64);
    });

    // Responder a la consulta del emisor sobre cuántos receptores hay
    socket.on('check_clientes', (callback) => {
        const salaReceptores = io.sockets.adapter.rooms.get('receptores');
        const cantidad = salaReceptores ? salaReceptores.size : 0;
        callback(cantidad);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
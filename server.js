const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado:', socket.id);

    // Registrar clientes en sus respectivas salas
    socket.on('soy_receptor', () => socket.join('receptores'));
    socket.on('soy_emisor', () => socket.join('emisores'));

    // Flujo de Video: Emisor -> Receptores
    socket.on('stream', (imageBase64) => {
        socket.to('receptores').emit('stream', imageBase64);
    });

    // Flujo de Comandos: Receptor -> Emisores
    socket.on('enviar_comando', (configuracion) => {
        console.log('Comando recibido:', configuracion);
        socket.to('emisores').emit('aplicar_comando', configuracion);
    });

    // Contador de espectadores
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
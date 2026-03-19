let peer, conn, others = {};

function hostGame() {
    peer = new Peer();
    peer.on('open', id => {
        document.getElementById("info").innerText = id;
    });

    peer.on('connection', c => {
        conn = c;
        setup();
    });
}

function joinGame() {
    peer = new Peer();
    peer.on('open', () => {
        conn = peer.connect(document.getElementById("peerId").value);
        setup();
    });
}

function setup() {
    conn.on('data', data => {
        others = data;
    });
}

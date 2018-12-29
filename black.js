const black = {
    speed: 50,
    canvas: document.getElementById('black-canvas'),
    drops: [],
    drip: function() {
        const flip = (Math.random() < 0.5);
        this.drops.push({
            x: Math.floor(Math.random() * black.canvas.width*0.8 + black.canvas.width*0.1),
            y: (flip) ? 0 : black.canvas.height,
            r: Math.ceil(1 + Math.random() * 2),
            v: (flip) ? Math.random() / 2 + Math.random() / 2 : (Math.random() / 2 + Math.random() / 2) * -1,
            c: Math.floor(Math.random() * 50)
        });
    },
    dripCheck: function() {
        if (Math.random() < 0.05 && this.drops.length < 20) black.drip();
    },
    draw: function(cur) {
        this.context.fillStyle = `rgb(${cur.c},${cur.c},${cur.c})`;
        this.context.beginPath();
        this.context.arc(cur.x,cur.y,cur.r,0,Math.PI*2);
        this.context.fill();
    },
    adjust: function() {
        const toRemove = [];
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.drops.forEach(function(cur,ind,arr) {
            cur.y += cur.v;
            black.draw(cur);
            if (black.removeCheck(cur)) toRemove.push(ind);
        });
        if (toRemove.length) this.remove(toRemove);
    },
    removeCheck: function(cur) {
        return (cur.v < 0) ? cur.y < 0 : cur.y > black.canvas.height;
    },
    remove: function(arr) {
        let n = 0;
        arr.forEach(function(cur,ind,arr) {
          black.drops.splice(cur,1-n);
          n++;
        });
    },
    main: function() {
        black.adjust();
        black.dripCheck();
    }
}

black.context = black.canvas.getContext('2d');

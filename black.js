const black = {
    ms: 60,
    canvas: document.getElementById('black-canvas'),
    dots: [],
    drip: function() {
        const flip = (Math.random() < 0.5);
        const x = Math.floor(Math.random() * black.canvas.width*0.8 + black.canvas.width*0.1);
        const y = (flip) ? 0 : black.canvas.height;
        const r = Math.ceil(1 + Math.random() * 2);
        const v = (flip) ? Math.random() / 2 + Math.random() / 2 : (Math.random() / 2 + Math.random() / 2) * -1;
        const c = Math.floor(Math.random() * 50);
        this.dots.push(new Dot(x, y, r, v, c));
    },
    dripCheck: function() {
        if (Math.random() < 0.05 && this.dots.length < 20) black.drip();
    },
    adjust: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = this.dots.length - 1; i >= 0; i--) {
            this.dots[i].adjust();
        }
    }    
}

black.context = black.canvas.getContext('2d');

function Dot(x, y, r, v, c) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.v = v;
    this.c = c;
}

Dot.prototype.adjust = function() {
    this.y += this.v;
    const remove = this.removeCheck();
    if (remove) {
        this.remove();
    } else {
        this.draw();
    }
}

Dot.prototype.draw = function() {
    const c = black.context;
    c.fillStyle = `rgb(${this.c}, ${this.c}, ${this.c})`;
    c.beginPath();
    c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    c.fill();
}

Dot.prototype.removeCheck = function() {
    return (this.v < 0) ? this.y + this.r < 0 : this.y - this.r > black.canvas.height;
}

Dot.prototype.remove = function() {
    black.dots.splice(black.dots.indexOf(this), 1);
}

function main() {
    black.dripCheck();
    black.adjust();
}

let loop = setInterval(main, black.ms);

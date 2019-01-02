function Dot(x, y, radius, verticalVelocity, horizontalVelocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.outerRadius = radius * dots.outerRadiusMultiplier;
    this.verticalVelocity = verticalVelocity;
    this.horizontalVelocity = horizontalVelocity;
    this.targetVerticalVelocity = verticalVelocity;
    this.targetHorizontalVelocity = horizontalVelocity;
}

Dot.prototype.adjust = function(index) {
    if (dots.drifting) {
        if (mouse.movable && mouse.coordinates.x && mouse.proximityCheck(this.x, this.y, this.outerRadius)) {
            this.push();
        } else if (this.checkInertia()) {
            this.horizontalVelocity *= 0.99;
            this.verticalVelocity *= 0.99;
            this.x += this.horizontalVelocity;
            this.y += this.verticalVelocity;
        } else {
            this.x += this.horizontalVelocity;
            this.y += this.verticalVelocity;
        }
        const remove = this.removeCheck();
        if (remove) {
            this.remove();
            return;
        }
    }
    this.draw();
    if (dots.dotArray.length > 0) dots.entangleAndMergeCheck(index);
};

Dot.prototype.checkInertia = function() {
    return (Math.abs(this.horizontalVelocity) > Math.abs(this.targetHorizontalVelocity)
        && Math.abs(this.horizontalVelocity - this.targetHorizontalVelocity) > 0.1);
};

Dot.prototype.push = function() {
    let x;
    let y;
    [x, y] = mouse.calculateDrift(this.x, this.y);
    this.x += x;
    this.y += y;
    this.horizontalVelocity = x;
    this.verticalVelocity = y;
    this.targetHorizontalVelocity = x / mouse.intensityLimit;
    this.targetVerticalVelocity = x / mouse.intensityLimit;
};

Dot.prototype.draw = function() {
    const ctx = screen.context;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
};

Dot.prototype.removeCheck = function() {
    const leftX = -this.outerRadius;
    const rightX = screen.canvas.width + this.outerRadius;
    const topY = -this.outerRadius;
    const bottomY = screen.canvas.height + this.outerRadius;
    return (this.x < leftX || this.x > rightX || this.y < topY || this.y > bottomY);
};

Dot.prototype.remove = function() {
    dots.dotArray.splice(dots.dotArray.indexOf(this), 1);
};

const dots = {
    maxBlurWidth: 3,
    outerRadiusMultiplier: 60,
    dotArray: [],
    drifting: false,
    mergable: false,
    drip: function() {
        const poleVertical = (Math.random() < 0.5);
        const x = Math.floor(Math.random() * screen.canvas.width * 0.8 + screen.canvas.width * 0.1);
        const radius = this.randomRadius();
        const y = (poleVertical) ? -radius * this.outerRadiusMultiplier : radius * this.outerRadiusMultiplier + screen.canvas.height;
        const verticalVelocity = (poleVertical) ? this.randomVelocity() : -this.randomVelocity();
        const horizontalVelocity = this.randomVelocity()
        this.dotArray.push(new Dot(x, y, radius, verticalVelocity, horizontalVelocity));
    },
    maximumDots: 15,
    dripCheck: function() {
        if (this.dripping && Math.random() < 0.1 && this.dotArray.length < this.maximumDots) dots.drip();
    },
    dripping: false,
    adjust: function() {
        screen.context.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
        for (let i = this.dotArray.length - 1; i >= 0; i--) {
            this.dotArray[i].adjust(i);
        }
    },
    mergeTwoDots(lowerIndexedDot, higherIndexedDot) {
        if (lowerIndexedDot.radius === higherIndexedDot.radius) {
            const xAdd = (higherIndexedDot.x - lowerIndexedDot.x) / 2;
            const yAdd = (higherIndexedDot.y - lowerIndexedDot.y) / 2;
            lowerIndexedDot.x += xAdd;
            lowerIndexedDot.y += yAdd;
        } else if (higherIndexedDot.radius > lowerIndexedDot.radius) {
            lowerIndexedDot.x = higherIndexedDot.x;
            lowerIndexedDot.y = higherIndexedDot.y;
        }
        const areaSum = (Math.PI * (lowerIndexedDot.radius ** 2)) + (Math.PI * (higherIndexedDot.radius ** 2));
        const newRadius = (areaSum / Math.PI) ** 0.5;
        lowerIndexedDot.radius = newRadius;
        lowerIndexedDot.horizontalVelocity += higherIndexedDot.horizontalVelocity;
        lowerIndexedDot.verticalVelocity += higherIndexedDot.verticalVelocity;
        higherIndexedDot.remove();
    },
    entangleAndMergeCheck(index) {
        if (index > 0) {
            const currentDot = this.dotArray[index];
            for (let i = index - 1; i >= 0; i--) {
                const nextDot = this.dotArray[i];
                const greaterOuterRadius = Math.max(currentDot.outerRadius, nextDot.outerRadius);
                const hypotenuse = (((currentDot.x - nextDot.x) ** 2) + ((currentDot.y - nextDot.y) ** 2)) ** 0.5;
                if (dots.mergable && hypotenuse < currentDot.radius + nextDot.radius) {
                    this.mergeTwoDots(nextDot, currentDot);
                    break;
                } else if (hypotenuse < greaterOuterRadius) {
                    this.entangle(currentDot, nextDot, greaterOuterRadius, hypotenuse);
                }
            }
        }
    },
    entangle(dot1, dot2, greaterOuterRadius, distance) {
        const intensity = greaterOuterRadius - distance;
        const width = (1 / greaterOuterRadius) * intensity * this.maxBlurWidth;
        const ctx = screen.context;
        ctx.shadowBlur = width * 100;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(dot1.x, dot1.y);
        ctx.lineTo(dot2.x, dot2.y);
        ctx.stroke();
    },
    minRadius: 1,
    radiusRange: 2,
    randomRadius() {
        return Math.ceil(this.minRadius + Math.random() * this.radiusRange);
    },
    randomVelocity() {
        return (Math.random() - 0.5) / 2;
    }
};

const mouse = {
    click(x, y) {
        const radius = dots.randomRadius();
        const verticalVelocity = dots.randomVelocity();
        const horizontalVelocity = dots.randomVelocity();
        dots.dotArray.push(new Dot(x, y, radius, verticalVelocity, horizontalVelocity));
    },
    move(x, y) {
        this.coordinates.x = x;
        this.coordinates.y = y;
    },
    movable: false,
    coordinates: {
        reset() {
            delete this.x;
            delete this.y;
        }
    },
    proximityCheck(x, y, outerRadius) {
        const hypotenuse = (((this.coordinates.x - x) ** 2) + ((this.coordinates.y - y) ** 2)) ** 0.5;
        return (hypotenuse < outerRadius);
    },
    intensityLimit: 2,
    logslider(position, max) {
        const minp = 5;
        const maxp = 1;
        const minv = Math.log(0);
        const maxv = Math.log(max);
        const scale = (maxv - minv) / (maxp - minp);
        return Math.exp(minv + scale * (position - minp));
    },
    calculateDrift(x2, y2, outerRadius) {
        const x1 = this.coordinates.x;
        const y1 = this.coordinates.y;
        const xDiff = x1 - x2;
        const yDiff = y1 - y2;
        const hypotenuse = ((xDiff ** 2) + (yDiff ** 2)) ** 0.5;
        const intensity = this.intensityLimit / (outerRadius - hypotenuse);
        const unit = -this.intensityLimit / (Math.abs(xDiff) + Math.abs(yDiff));
        let x = unit * xDiff;
        let y = unit * yDiff;
        return [x, y];
    }
};

const screen = {
    _ms: 50,
    get ms() {
        return this._ms;
    },
    set ms(n) {
        this._ms = n;
        clearInterval(this.loop);
        this.loop = setInterval(this.main, this.ms);
    },
    resize(width, height) {
        const cnv = this.canvas;
        const ctx = this.context;
        cnv.width = width;
        cnv.height = height;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'white';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.shadowBlur = 0.5;
    },
    randomSeed(total = 0) {
        for (var i = 0; i < total; i++) {
            const x = Math.floor(Math.random() * this.canvas.width * 0.8);
            const y = Math.floor(Math.random() * this.canvas.height * 0.8);
            const radius = dots.randomRadius();
            const verticalVelocity = dots.randomVelocity();
            const horizontalVelocity = dots.randomVelocity();
            dots.dotArray.push(new Dot(x, y, radius, verticalVelocity, horizontalVelocity));
        }
    },
    releasedKey(btn) {
        const key = btn.keyCode;
        if (key === 90) { // Z
            dots.drifting = !dots.drifting;
        } else if (key === 88) { // X
            mouse.movable = ! mouse.movable;
        } else if (key === 67) { // C
            dots.mergable = !dots.mergable;
        } else if (key === 86) { // V
            dots.dripping = !dots.dripping;
        } else if (key === 85) { // U
            dots.dotArray.pop()
        } else if (key === 84) { // T
            screen.randomSeed(10);
        } else if (key === 82) { // R
            dots.dotArray = [];
        }
    },
    main() {
        dots.dripCheck();
        dots.adjust();
        mouse.coordinates.reset();
    }
};

screen.canvas = document.getElementById('entanglement-canvas');
screen.context = screen.canvas.getContext('2d');
screen.resize(innerWidth, innerHeight);
screen.context.lineCap = 'round';
screen.context.shadowColor = 'white';
screen.context.fillStyle = 'white';
screen.context.strokeStyle = 'white';
screen.loop = setInterval(screen.main, screen.ms);

window.addEventListener("resize", () => screen.resize(innerWidth, innerHeight));
document.addEventListener("keyup", screen.releasedKey);
document.addEventListener('mousemove', (e) => mouse.move(e.clientX, e.clientY));
document.addEventListener('click', (e) => mouse.click(e.clientX, e.clientY));

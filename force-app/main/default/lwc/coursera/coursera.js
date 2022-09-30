import { api, LightningElement, track } from 'lwc';
export default class Coursera extends LightningElement {
    showcart = false;
    courses = [];
    handleGotocart(event){
        this.courses = event.detail;
        this.showcart = true;
    }
}


// Runner.instance_.setSpeed(1000) Runner.instance_.tRex.setJumpVelocity(20)

// Runner.prototype.gameOver=function(){}

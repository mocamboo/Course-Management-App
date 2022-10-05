import { api, LightningElement, track } from 'lwc';
import generateData from './helper';
export default class Coursera extends LightningElement {
    showcart = true;
    courses = [];

    get customCourses() {
        const newMap = new Map();
        this.courses.map(obj => ({ ...obj, Quantity__c: 1, totalPrice: obj.Price__c, totalCount: 1 })).forEach(element => {
            newMap.set(element.Id, element);
        });
        return newMap;
    }

    connectedCallback() {
        this.courses = generateData({ amountOfRecords: 5 });
    }
    handleGotocart(event) {
        this.courses = event.detail;
        this.showcart = true;
    }


}


import { api, LightningElement, track } from 'lwc';

const columns = [
    { label: 'Course Name', fieldName: 'Name'},
    { label: 'Category', fieldName: 'Category__c'},
    { label: 'Hours', fieldName: 'Hours__c'},
    { label: 'Quantity', fieldName: 'Quantity', editable: true  },
    { label: 'Price', fieldName: 'Price__c', type: 'currency'},
];
export default class CourseraCart extends LightningElement {
    @api courses = [];
    columns = columns;
    @track data = [];

    connectedCallback(){
        this.addQuantity();
    }

    addQuantity(){
        this.data = this.courses.map(obj => ({ ...obj, Quantity: 1 }));
    }
}

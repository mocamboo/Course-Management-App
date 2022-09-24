import { LightningElement, api } from 'lwc';

export default class CourseTile extends LightningElement {
    @api course;

    // handleCourseSelected() {
    //     const selectedEvent = new CustomEvent('selected', {
    //         detail: this.property.Id
    //     });
    //     this.dispatchEvent(selectedEvent);
    // }

    // get backgroundImageStyle() {
    //     return `background-image:url(${this.property.Thumbnail__c})`;
    // }
}
import { LightningElement, api, track } from 'lwc';
export default class CourseTile extends LightningElement {
    @api isdisabled = false;
    @api course;
    @api disableButton() {
        // this.template.querySelector('lightning-button').disabled = true;
        this.isdisabled = true;
    }

    @api enableButton() {
        // this.template.querySelector('lightning-button').disabled = true;
        this.isdisabled = false;
    }
    get ISDISABLE() {
        return this.isdisabled;
    }

    handleAddClick() {
        this.dispatchEvent(new CustomEvent('addcourse', { detail: this.course }));
    }
    handleDeleteClick() {
        // this.isDisabled = false;
        this.dispatchEvent(new CustomEvent('deletecourse', { detail: this.course }));
    }
    connectedCallback() {
        this.dispatchEvent(new CustomEvent('checkadd', { detail: this.course }));
        // this.isDisabled = this.course.isAdded;
    }
}
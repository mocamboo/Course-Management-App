import { LightningElement, wire} from 'lwc';
import getPagedCourseList from '@salesforce/apex/courseraLwcController.getPagedCourseList';

const PAGE_SIZE = 3;

export default class CourseTilesList extends LightningElement {
    pageNumber = 1;
    pageSize = PAGE_SIZE;

    searchKey = '';
    maxPrice = 9999;
    result=[];
    error;
    

    @wire(getPagedCourseList, {
        searchKey: '$searchKey',
        maxPrice: '$maxPrice',
        pageSize: '$pageSize',
        pageNumber: '$pageNumber'
    })
    wiredCourses({ error, data }){
        if (data) {
            this.result = data;
            console.log(data);
            
        } else if (error) {
            console.log(error);
        }
    }

    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
    }

    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
    }

}
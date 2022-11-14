import LightningDatatable from 'lightning/datatable';
import customPicklistType from './customPicklistType.html'

export default class CustomDatatableType extends LightningDatatable {
    static customTypes = {
        quantityPicklist: {
            template: customPicklistType,
            standardCellLayout: true,
            typeAttributes: ['options', 'value', 'placeholder', 'label', 'context'],
        },
    }

}
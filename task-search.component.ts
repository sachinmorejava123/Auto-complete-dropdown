import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from 'src/app/services/config.service';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
@Component({
  selector: 'tm-task-search',
  templateUrl: './task-search.component.html',
  styleUrls: ['./task-search.component.scss']
})
export class TaskSearchComponent implements OnInit {
  /* Variable declaration */
  @Output() filterByTypeEvent: EventEmitter<any> = new EventEmitter();
  @Output() filterByViewEvent: EventEmitter<any> = new EventEmitter();
  @Output() searchTaskEvent: EventEmitter<any> = new EventEmitter();
  @Output() filterEvent: EventEmitter<any> = new EventEmitter();
  @Output() searchProviderEvent: EventEmitter<any> = new EventEmitter();
  @Output() filterFormSubmitEvent: EventEmitter<any> = new EventEmitter();
  closeResult: string;
  config: any;
  taskFilterForm: FormGroup;
  providerFormatter = (provider: { provider_nm: string }) => provider.provider_nm.toUpperCase();
  facilityFormatter = (facility: { facility_name: string }) => facility.facility_name.toUpperCase();

  constructor(
    private modalService: NgbModal,
    private configService: ConfigService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.config = this.configService.config;
    this.config.tasklistTypes.unshift({
      tasklist_type_id: '0',
      tasklist_type_desc: 'All'
    });
    this.config.tasklistStatuses.unshift({
      tasklist_status_id: '0',
      tasklist_status_desc: 'All',
      default: true
    });

    // TODO validations
    this.taskFilterForm = this.formBuilder.group({
      searchTerm: '',
      taskType: 'All',
      taskStatus: 'All',
      provider: [],
      facility: []
    });
  }

  // Method for search provider
  searchProvider = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term =>
        term === ''
          ? []
          : this.config.providerLastNames
              .filter(
                v =>
                  v.provider_nm.toLowerCase().indexOf(term.toLowerCase()) > -1
              )
              .slice(0, 10)
      )
    )

  // Method for search Facility
  searchFacilities = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term =>
        term === ''
          ? []
          : this.config.facilitiesList
              .filter(
                v =>
                  v.facility_name.toLowerCase().indexOf(term.toLowerCase()) > -1
              )
              .slice(0, 10)
      )
    )

  // Filter Event
  onFilter(event) {
    this.filterEvent.emit(event);
  }

  // Opening filter modal
  open(content) {
    this.modalService.open(content, {
      size: 'lg',
      centered: true,
      backdrop: true
    });
  }

  // Submitting filter Form
  onSubmit() {
    this.filterFormSubmitEvent.emit(this.taskFilterForm.value);
  }
}

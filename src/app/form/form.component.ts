import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit {
  dsp: boolean = false;
  successMessage: boolean = false;
  isSubmitting: boolean = false;
  submits: string = "Send Message";
  hd: boolean = false;

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl('', [Validators.required, Validators.pattern('[A-Z a-z]*')]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern('[0-9]*'), Validators.maxLength(10), Validators.minLength(10)]),
    subject: new FormControl('', [Validators.required]),
    messege: new FormControl('', [Validators.required, Validators.maxLength(400)])
  });

  private readonly emailEndpoint = "https://formsubmit.co/ajax/shubhammisra800@gmail.com";
  private readonly backendEndpoint = "https://profilebalckend-production.up.railway.app/data/insert";

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.submits = "Send Message";
    this.isSubmitting = false;
  }

  get getName() {
    return this.form.get('name');
  }

  get getEmail() {
    return this.form.get('email');
  }

  get getPhone() {
    return this.form.get('phone');
  }

  get getSubject() {
    return this.form.get('subject');
  }

  get getMessege() {
    return this.form.get('messege');
  }

  submit(fmdata: FormGroup) {
    if (fmdata.valid) {
      this.isSubmitting = true;
      this.submits = "Sending...";
      this.dsp = false;
      this.successMessage = false;

      const formVal = fmdata.value;
      const emailPayload = {
        name: formVal.name,
        email: formVal.email,
        phone: formVal.phone,
        subject: formVal.subject,
        _subject: `New Portfolio Inquiry from ${formVal.name}: ${formVal.subject}`,
        message: formVal.messege,
        _replyto: formVal.email,
        _template: 'table',
        _captcha: 'false'
      };

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });

      // Submit to FormSubmit to deliver email directly to inbox
      this.http.post(this.emailEndpoint, emailPayload, { headers }).subscribe({
        next: () => {
          this.successMessage = true;
          this.submits = "Send Message";
          this.isSubmitting = false;
          this.hd = false;
          this.form.reset();

          // Also attempt to backup save to backend database asynchronously
          try {
            this.http.post(this.backendEndpoint, formVal).subscribe({
              error: (err) => console.log('Database backup note:', err)
            });
          } catch (e) {
            console.log('Database sync skipped');
          }
        },
        error: (error) => {
          console.error('Email submission error:', error);
          this.dsp = true;
          this.submits = "Send Message";
          this.isSubmitting = false;
        }
      });
    } else {
      this.hd = true;
    }
  }

  closeAlert() {
    this.dsp = false;
  }

  closeSuccessAlert() {
    this.successMessage = false;
  }
}

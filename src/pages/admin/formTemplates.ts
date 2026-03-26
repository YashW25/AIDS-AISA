export type FieldType = 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'select' | 'radio' | 'checkbox' | 'date';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface FormSettings {
  header_text: string;
  subheader: string;
  footer_text: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  colorClass: string;
  settings: FormSettings;
  fields: Omit<FormField, 'id'>[];
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'student-feedback',
    name: 'Student Feedback Form',
    description: 'Collect feedback from students about courses, events or club activities',
    icon: '💬',
    colorClass: 'bg-blue-500/10 text-blue-600 border-blue-200',
    settings: {
      header_text: 'AISA Club',
      subheader: 'Student Feedback Form',
      footer_text: 'Responses are confidential and used for improvement purposes only.',
    },
    fields: [
      { type: 'text', label: 'Full Name', placeholder: 'Enter your full name', required: true },
      { type: 'text', label: 'Roll Number', placeholder: 'e.g. 2021CS001', required: true },
      { type: 'select', label: 'Branch', options: ['Computer Science', 'Information Technology', 'ENTC', 'Mechanical', 'Civil', 'Other'], required: true },
      { type: 'radio', label: 'Year of Study', options: ['First Year', 'Second Year', 'Third Year', 'Final Year'], required: true },
      { type: 'radio', label: 'Overall Rating', options: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'], required: true },
      { type: 'textarea', label: 'What did you like most?', placeholder: 'Share what you enjoyed...', required: false },
      { type: 'textarea', label: 'Suggestions for Improvement', placeholder: 'How can we do better?', required: false },
    ],
  },
  {
    id: 'event-registration',
    name: 'Event Registration Form',
    description: 'Register students for upcoming club events and workshops',
    icon: '📋',
    colorClass: 'bg-green-500/10 text-green-700 border-green-200',
    settings: {
      header_text: 'AISA Club',
      subheader: 'Event Registration Form',
      footer_text: 'Registration confirmed upon submission. Venue details will be shared via email.',
    },
    fields: [
      { type: 'text', label: 'Full Name', placeholder: 'Enter your full name', required: true },
      { type: 'email', label: 'Email Address', placeholder: 'your@email.com', required: true },
      { type: 'phone', label: 'Mobile Number', placeholder: '+91 9876543210', required: true },
      { type: 'text', label: 'Roll Number', placeholder: 'e.g. 2021CS001', required: true },
      { type: 'select', label: 'Branch', options: ['Computer Science', 'Information Technology', 'ENTC', 'Mechanical', 'Civil', 'Other'], required: true },
      { type: 'radio', label: 'Year of Study', options: ['First Year', 'Second Year', 'Third Year', 'Final Year'], required: true },
      { type: 'select', label: 'T-Shirt Size', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], required: false },
      { type: 'radio', label: 'Attended AISA events before?', options: ['Yes, multiple times', 'Yes, once', 'No, this is my first'], required: false },
      { type: 'text', label: 'Emergency Contact (Name & Number)', placeholder: 'Guardian name and number', required: false },
    ],
  },
  {
    id: 'student-profile',
    name: 'Student Profile Form',
    description: 'Collect comprehensive student profile and contact details',
    icon: '👤',
    colorClass: 'bg-purple-500/10 text-purple-700 border-purple-200',
    settings: {
      header_text: 'AISA Club',
      subheader: 'Student Profile Registration',
      footer_text: 'Your information is stored securely and used only for club activities.',
    },
    fields: [
      { type: 'text', label: 'Full Name', placeholder: 'As per college records', required: true },
      { type: 'text', label: 'Roll Number', placeholder: 'e.g. 2021CS001', required: true },
      { type: 'email', label: 'College Email', placeholder: 'student@college.edu', required: true },
      { type: 'phone', label: 'Mobile Number', placeholder: '+91 9876543210', required: true },
      { type: 'date', label: 'Date of Birth', required: false },
      { type: 'radio', label: 'Gender', options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'], required: false },
      { type: 'select', label: 'Branch', options: ['Computer Science', 'Information Technology', 'ENTC', 'Mechanical', 'Civil', 'Other'], required: true },
      { type: 'radio', label: 'Year of Study', options: ['First Year', 'Second Year', 'Third Year', 'Final Year'], required: true },
      { type: 'number', label: 'Current CGPA', placeholder: 'e.g. 8.5', required: false },
      { type: 'textarea', label: 'Technical Skills', placeholder: 'e.g. Python, JavaScript, Machine Learning...', required: false },
      { type: 'text', label: 'LinkedIn Profile URL', placeholder: 'https://linkedin.com/in/...', required: false },
    ],
  },
  {
    id: 'club-survey',
    name: 'Club Activity Survey',
    description: 'Gather feedback on club activities and plan future improvements',
    icon: '📊',
    colorClass: 'bg-orange-500/10 text-orange-700 border-orange-200',
    settings: {
      header_text: 'AISA Club',
      subheader: 'Club Activity Survey',
      footer_text: 'Your responses help us improve and serve you better.',
    },
    fields: [
      { type: 'text', label: 'Name (Optional)', placeholder: 'Leave blank to remain anonymous', required: false },
      { type: 'select', label: 'Branch', options: ['Computer Science', 'Information Technology', 'ENTC', 'Mechanical', 'Civil', 'Other'], required: false },
      { type: 'radio', label: 'Year of Study', options: ['First Year', 'Second Year', 'Third Year', 'Final Year'], required: false },
      { type: 'checkbox', label: 'Activities you participated in', options: ['Hackathons', 'Workshops', 'Guest Lectures', 'Technical Competitions', 'Cultural Events', 'Community Service', 'Industrial Visits', 'Sports'], required: false },
      { type: 'radio', label: 'Overall Satisfaction', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'], required: true },
      { type: 'checkbox', label: 'Areas needing improvement', options: ['Event Organization', 'Communication', 'Frequency of Events', 'Diversity of Activities', 'Infrastructure', 'Faculty Support'], required: false },
      { type: 'textarea', label: 'Suggest new activities or events', placeholder: 'What would you like to see in the future?', required: false },
      { type: 'radio', label: 'Would you recommend AISA to juniors?', options: ['Definitely Yes', 'Probably Yes', 'Not Sure', 'Probably No'], required: false },
    ],
  },
  {
    id: 'teacher-evaluation',
    name: 'Teacher Evaluation Form',
    description: 'Student evaluation of faculty teaching quality and effectiveness',
    icon: '🎓',
    colorClass: 'bg-red-500/10 text-red-700 border-red-200',
    settings: {
      header_text: 'ISBM College of Engineering',
      subheader: 'Faculty Evaluation Form — Confidential',
      footer_text: 'Responses are anonymous. Results are used to improve teaching quality.',
    },
    fields: [
      { type: 'text', label: 'Student Name (Optional)', placeholder: 'Leave blank to remain anonymous', required: false },
      { type: 'text', label: 'Faculty Name', placeholder: 'Enter faculty name', required: true },
      { type: 'text', label: 'Subject', placeholder: 'Subject being evaluated', required: true },
      { type: 'select', label: 'Department', options: ['Computer Science', 'Information Technology', 'ENTC', 'Mechanical', 'Civil', 'Basic Sciences'], required: true },
      { type: 'radio', label: 'Punctuality & Regularity', options: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'], required: true },
      { type: 'radio', label: 'Clarity of Teaching', options: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'], required: true },
      { type: 'radio', label: 'Interaction & Approachability', options: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'], required: true },
      { type: 'radio', label: 'Use of Teaching Aids', options: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'], required: true },
      { type: 'radio', label: 'Overall Rating', options: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'], required: true },
      { type: 'textarea', label: 'Additional Comments', placeholder: 'Any other feedback...', required: false },
    ],
  },
];

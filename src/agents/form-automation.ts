import { runAutomationSync } from '../core/tinyfish-client.js';
import { RunStatus, Logger } from '../core/types.js';

export interface SubmissionForm {
  hackathon_url: string;
  project_name: string;
  project_description: string;
  team_members: Array<{
    name: string;
    email: string;
    role?: string;
  }>;
  technologies: string[];
  github_url?: string;
  demo_url?: string;
  video_url?: string;
}

/**
 * Form Automation Agent
 * Auto-fills hackathon submission forms with project details
 */
export async function autoFillSubmissionForm(
  submission: SubmissionForm
): Promise<{
  success: boolean;
  error?: string;
  form_fields_filled?: number;
  status?: string;
}> {
  Logger.info({ hackathon_url: submission.hackathon_url }, 'Starting form automation');

  const formData = `
    Project Name: ${submission.project_name}
    Description: ${submission.project_description}
    Team: ${submission.team_members.map((m) => m.name).join(', ')}
    Technologies: ${submission.technologies.join(', ')}
    GitHub: ${submission.github_url || 'N/A'}
    Demo: ${submission.demo_url || 'N/A'}
    Video: ${submission.video_url || 'N/A'}
  `;

  const goal = `
    Navigate to the submission form on this page and fill it with the following information:
    ${formData}
    
    Steps:
    1. Find and fill all form fields with the provided data
    2. For "Project Name" field, enter: "${submission.project_name}"
    3. For "Description" field, enter: "${submission.project_description}"
    4. For "Technologies" or "Tech Stack", enter: ${JSON.stringify(submission.technologies)}
    5. If there's a GitHub field, enter: "${submission.github_url || 'Not provided'}"
    6. If there's a Demo/Live URL field, enter: "${submission.demo_url || 'Not provided'}"
    7. For team members (if applicable):
       ${submission.team_members.map((m) => `- Name: ${m.name}, Email: ${m.email}`).join('\n       ')}
    8. DO NOT SUBMIT - just fill the form
    9. Take a screenshot after all fields are filled
    
    Return JSON with:
    {
      "success": true/false,
      "form_fields_filled": number,
      "fields_found": ["field1", "field2"],
      "status": "filled" or "error description"
    }
  `;

  try {
    const result = await runAutomationSync({
      url: submission.hackathon_url,
      goal,
      browser_profile: (process.env.BROWSER_PROFILE as 'stealth' | 'lite') || 'stealth',
      proxy_config: {
        enabled: process.env.PROXY_ENABLED === 'true',
        country_code: (process.env.PROXY_COUNTRY_CODE as any) || 'US',
      },
    });

    if (result.status !== RunStatus.COMPLETED) {
      return {
        success: false,
        error: 'Automation failed',
        status: 'failed',
      };
    }

    const data = result.result as {
      success: boolean;
      form_fields_filled?: number;
      status?: string;
    };

    Logger.info(
      { fields: data.form_fields_filled, hackathon: submission.hackathon_url },
      'Form automation completed'
    );

    return {
      success: data.success,
      form_fields_filled: data.form_fields_filled || 0,
      status: data.status,
    };
  } catch (error) {
    Logger.error({ error, hackathon_url: submission.hackathon_url }, 'Form error');
    return {
      success: false,
      error: String(error),
      status: 'error',
    };
  }
}

/**
 * Detect form fields on submission page
 */
export async function detectFormFields(hackathonUrl: string): Promise<string[]> {
  Logger.info({ url: hackathonUrl }, 'Detecting form fields');

  const goal = `
    Analyze the submission form on this page and list all input fields.
    
    Return JSON:
    {
      "fields": [
        "field_name_1",
        "field_name_2"
      ],
      "field_types": {
        "field_name_1": "text|text_area|select|file|email|date"
      }
    }
  `;

  try {
    const result = await runAutomationSync({
      url: hackathonUrl,
      goal,
      browser_profile: (process.env.BROWSER_PROFILE as 'stealth' | 'lite') || 'stealth',
      proxy_config: {
        enabled: process.env.PROXY_ENABLED === 'true',
        country_code: (process.env.PROXY_COUNTRY_CODE as any) || 'US',
      },
    });

    if (result.status === RunStatus.COMPLETED && result.result) {
      const data = result.result as { fields: string[] };
      return data.fields || [];
    }

    return [];
  } catch (error) {
    Logger.error({ error, url: hackathonUrl }, 'Error detecting fields');
    return [];
  }
}

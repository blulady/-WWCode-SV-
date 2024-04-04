from django.core import mail
from django.test import TestCase, override_settings
from ..helper_functions import send_email_helper, generate_registration_token
from datetime import datetime


class HelperFunctionsTestCase(TestCase):

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_send_email_helper(self):
        to_email = 'WWCodeSV@gmail.com'
        subject = 'Welcome to WWCode-SV'
        template_file = 'welcome_sample.html'
        context_data = {"user": "UserName",
                        "registration_link": "https://login.yahoo.com/account/create",
                        "social_media_link": "https://www.linkedin.com/company/women-who-code/"
                        }
        send_email_helper(to_email, subject, template_file, context_data)

        # Test that one message has been sent.
        self.assertEquals(len(mail.outbox), 1)

        # Verify that the "subject" of the first message is correct.
        self.assertEquals(mail.outbox[0].subject, 'Welcome to WWCode-SV')

        # Verify that the "to" of the first message is correct.
        self.assertEquals(mail.outbox[0].to, ['WWCodeSV@gmail.com'])

    def test_generate_registration_token_length(self):
        # valid token should have a length of 46 chars
        token_length = 46
        new_registration_token = generate_registration_token()
        self.assertEquals(len(new_registration_token), token_length)

    def test_generate_registration_token_date(self):
        # valid token should contain the date string at the end
        new_registration_token = generate_registration_token()
        timestamp_str = new_registration_token[-14:]
        try:
            datetime.strptime(timestamp_str, '%Y%m%d%H%M%S')
        except ValueError:
            self.fail(f"Failed to convert'{timestamp_str}' to the expected format")

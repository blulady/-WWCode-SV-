from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import MaxValueValidator, MaxLengthValidator

# Create your models here.


class UserProfile(models.Model):
    PENDING = 'PENDING'
    ACTIVE = 'ACTIVE'
    INACTIVE = 'INACTIVE'
    REGISTERED_USER_VALID_STATUSES = [ACTIVE, INACTIVE]
    ALL_STATUS_VALUES = {ACTIVE, INACTIVE, PENDING}

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20,
                              choices=((PENDING, PENDING),
                                       (ACTIVE, ACTIVE), (INACTIVE, INACTIVE)),
                              default='ACTIVE'
                              )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True)
    timezone = models.CharField(max_length=255, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    photo = models.CharField(max_length=255, null=True, blank=True)
    slack_handle = models.CharField(max_length=255, null=True, blank=True)
    linkedin = models.CharField(max_length=255, null=True, blank=True)
    instagram = models.CharField(max_length=255, null=True, blank=True)
    facebook = models.CharField(max_length=255, null=True, blank=True)
    twitter = models.CharField(max_length=255, null=True, blank=True)
    medium = models.CharField(max_length=255, null=True, blank=True)

    def is_pending(self):
        return self.status == self.PENDING

    def activate(self):
        self.status = self.ACTIVE


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


class Team(models.Model):
    name = models.CharField(max_length=150)
    members = models.ManyToManyField(User, through='User_Team')

    def __str__(self):
        return self.name


class Role(models.Model):
    VOLUNTEER = 'VOLUNTEER'
    LEADER = 'LEADER'
    DIRECTOR = 'DIRECTOR'
    VALID_ROLES = [VOLUNTEER, LEADER, DIRECTOR]

    name = models.CharField(max_length=20)
    users = models.ManyToManyField(User, through='User_Team')

    def __str__(self):
        return self.name


class User_Team(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, null=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user_id', 'team_id', 'role_id'], name='unique user_team')
        ]

    def highest_role(user_id):
        return User_Team.objects.filter(user=user_id).order_by('-role_id').values('role__name')[0]['role__name']


class Resource(models.Model):
    slug = models.CharField(max_length=150, null=False, blank=False, unique=True)
    edit_link = models.CharField(max_length=255, null=False, blank=False)
    published_link = models.CharField(max_length=255, null=False, blank=False)


class Invitee(models.Model):
    email = models.EmailField(max_length=254, null=False, blank=False, unique=True)
    message = models.TextField(blank=True, null=True, validators=[MaxLengthValidator(2000)])
    role = models.ForeignKey(Role, on_delete=models.CASCADE, default=1)
    registration_token = models.CharField(null=False, blank=False, max_length=150)
    resent_counter = models.PositiveSmallIntegerField(default=0, validators=[MaxValueValidator(5)])
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Host(models.Model):
    company = models.CharField(max_length=255, unique=True, db_collation="case_insensitive")
    city = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True, validators=[MaxLengthValidator(2000)])
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='updated_by')
    updated_at = models.DateTimeField(auto_now=True)


class Contact(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(max_length=254, null=True, blank=True)
    info = models.TextField(null=True, blank=True, validators=[MaxLengthValidator(2000)])
    company = models.ForeignKey(Host, on_delete=models.CASCADE, related_name='contacts')


class Mentor(models.Model):
    LEVEL_CHOICES = (
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    )
    RELIABILITY_CHOICES = (
        ('Unknown', 'Unknown'),
        ('Poor', 'Poor'),
        ('Adequate', 'Adequate'),
        ('Good', 'Good'),
        ('Excellent', 'Excellent'),
    )
    first_name = models.CharField(max_length=255, null=False, blank=False, db_collation="case_insensitive")
    last_name = models.CharField(max_length=255, null=False, blank=False)
    email = models.EmailField(max_length=255, null=False, blank=False, unique=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    reliability = models.CharField(max_length=20, choices=RELIABILITY_CHOICES)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='mentor_created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='mentor_updated_by')
    updated_at = models.DateTimeField(auto_now=True)

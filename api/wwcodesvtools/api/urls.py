from django.urls import path
from api.views.InviteeView import InviteeViewSet
from drf_yasg.utils import swagger_auto_schema
from .swagger import login_response as resp
from api.views.UserRegistrationView import UserRegistrationView
from api.views.MailSender import MailSender
from api.views.EditMemberRoleTeamsView import EditMemberRoleTeamsView
from api.views.GetMembersView import GetMembersView, GetMemberInfoView
from api.views.UserProfileView import UserProfileView
from api.views.RequestPasswordResetView import RequestPasswordResetView
from api.views.SetNewPasswordView import SetNewPasswordView
from api.views.ChangePasswordView import ChangePasswordView
from api.views.CustomTokenObtainPairView import CustomTokenObtainPairView
from api.views.CustomTokenRefreshView import CustomTokenRefreshView
from api.views.LogoutView import LogoutView
from api.views.DeleteMemberView import DeleteMemberView
from api.views.GetTeamsView import GetTeamsView
from api.views.RolesView import RolesView
from api.views.ValidateRegLinkView import ValidateRegLinkView
from api.views.UpdateMemberStatusView import UpdateMemberStatusView
from api.views.resources_view import ResourceViewSet
from api.views.DeleteMemberRoleView import DeleteMemberRoleView
from api.views.UserView import UserView
from api.views.HostView import HostView
from api.views.MentorView import MentorView
from api.views.DirectorResendInviteView import DirectorResendInviteView
from rest_framework.routers import SimpleRouter

router = SimpleRouter()
router.register(r'resources', ResourceViewSet)
router.register(r'invitee', InviteeViewSet)
router.register(r'host', HostView)
router.register(r'mentor', MentorView)


decorated_login_view = \
    swagger_auto_schema(
        method='post',
        responses=resp.response
    )(CustomTokenObtainPairView.as_view())

urlpatterns = [
    path("user/activate/", UserRegistrationView.as_view()),
    path("send_email_example/", MailSender.as_view()),
    path("login/", decorated_login_view),
    path("login/refresh/", CustomTokenRefreshView.as_view()),
    path('logout/', LogoutView.as_view()),
    path("users/", GetMembersView.as_view()),
    path("user/profile/", UserProfileView.as_view()),
    path('user/<int:id>/', GetMemberInfoView.as_view()),
    path('user/reset_password/request/', RequestPasswordResetView.as_view()),
    path('user/reset_password/confirm/', SetNewPasswordView.as_view()),
    path('user/password/', ChangePasswordView.as_view()),
    path('user/delete/<int:id>/', DeleteMemberView.as_view()),
    path('user/edit/<int:id>/status/', UpdateMemberStatusView.as_view()),
    path('user/edit/<int:id>/role_teams/', EditMemberRoleTeamsView.as_view()),
    path('user/edit/<int:id>/role/<str:role>/', DeleteMemberRoleView.as_view()),
    path('teams/', GetTeamsView.as_view()),
    path('roles/', RolesView.as_view()),
    path('validate/', ValidateRegLinkView.as_view()),
    path('user/name/', UserView.as_view()),
    path('invitee/director_resend/', DirectorResendInviteView.as_view()),
]


urlpatterns += router.urls

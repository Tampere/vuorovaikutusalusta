import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { EditGeneralNotification } from './EditGeneralNotification';
import { GeneralNotificationList } from './GeneralNotificationList';
import { AdminAppBar } from '../AdminAppBar';
import {
  GeneralNotification,
  NotificationFormData,
} from '@interfaces/generalNotification';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import { useToasts } from '@src/stores/ToastContext';
import { useUser } from '@src/stores/UserContext';

const containerStyle = {
  margin: 'auto',
  width: '800px',
  display: 'flex',
  height: 'calc(100vh - 64px)',
  flexDirection: 'column',
  padding: '3rem',
  gap: '2rem',
};

export function GeneralNotifications() {
  const { tr } = useTranslations();
  const { showToast } = useToasts();
  const { activeUserIsAdmin } = useUser();

  const [activeNotification, setActiveNotification] = useState<{
    data: GeneralNotification | null;
    editing: boolean;
  }>({ data: null, editing: false });

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<GeneralNotification[]>([]);

  async function fetchNotifications() {
    setLoading(true);
    const response = await request<GeneralNotification[]>(
      '/api/general-notifications',
    );
    const data = response.map((res) => ({
      ...res,
      startDate: res.startDate ? new Date(res.startDate) : null,
      endDate: res.endDate ? new Date(res.endDate) : null,
    }));
    setNotifications(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function onSubmit(
    formData: NotificationFormData,
    notificationId?: string,
  ) {
    try {
      // If either published flag is true and startDate is null, set it to now
      const effectiveStartDate =
        !formData.startDate &&
        (formData.publishedInternally || formData.publishedExternally)
          ? new Date()
          : formData.startDate;

      if (notificationId) {
        await request(`/api/general-notifications/${notificationId}`, {
          method: 'PUT',
          body: {
            ...formData,
            startDate: effectiveStartDate?.toISOString() ?? null,
            endDate: formData.endDate?.toISOString() ?? null,
          },
        });
        showToast({
          message: tr.GeneralNotification.updateSuccess,
          severity: 'success',
        });
      } else {
        await request('/api/general-notifications', {
          method: 'POST',
          body: {
            ...formData,
            startDate: effectiveStartDate?.toISOString() ?? null,
            endDate: formData.endDate?.toISOString() ?? null,
          },
        });
        showToast({
          message: tr.GeneralNotification.addSuccess,
          severity: 'success',
        });
      }
      setActiveNotification({ data: null, editing: false });
      await fetchNotifications();
      return true;
    } catch (e) {
      showToast({
        message: tr.GeneralNotification.updateFailed,
        severity: 'error',
      });
      return false;
    }
  }

  async function onDelete(notificationId: string) {
    try {
      await request(`/api/general-notifications/${notificationId}`, {
        method: 'DELETE',
      });
      showToast({
        message: tr.GeneralNotification.deleteSuccess,
        severity: 'success',
      });
      setActiveNotification({ data: null, editing: false });
      await fetchNotifications();
    } catch (e) {
      showToast({
        message: tr.GeneralNotification.deleteFailed,
        severity: 'error',
      });
    }
  }

  return (
    <>
      <AdminAppBar labels={[tr.AppBar.generalNotifications]} />
      <Box sx={containerStyle}>
        {activeUserIsAdmin && (
          <EditGeneralNotification
            notification={activeNotification.data}
            onSubmit={onSubmit}
            editing={activeNotification.editing}
            onEdit={() => setActiveNotification({ data: null, editing: true })}
            onCancel={() => {
              setActiveNotification({ data: null, editing: false });
            }}
            onDelete={(notificationId) => onDelete(notificationId)}
          />
        )}
        <GeneralNotificationList
          editing={activeNotification.editing}
          loading={loading}
          activeNotification={activeNotification.data}
          notifications={notifications}
          editingEnabled={activeUserIsAdmin}
          onCancel={() => setActiveNotification({ data: null, editing: false })}
          onEdit={(notification) => {
            setActiveNotification({ data: notification, editing: true });
          }}
        />
      </Box>
    </>
  );
}

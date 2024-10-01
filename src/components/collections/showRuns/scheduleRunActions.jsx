import { useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { getCronByCollection, deleteCron, cronStatus } from '../../../services/cronJobs';

export const ScheduledRunsActions = (collectionId, activeTab) => {
    const queryClient = useQueryClient();
    const { data: scheduledRuns = [], isError, error } = useQuery(
        ['scheduledRuns', collectionId],
        () => getCronByCollection(collectionId),
        {
            enabled: activeTab === 'scheduled',
            staleTime: 1000,
        }
    );

    const deleteCronById = useCallback(async (cronId) => {
        try {
            await deleteCron(cronId);
            queryClient.setQueryData(['scheduledRuns', collectionId], oldRuns => oldRuns.filter(run => run.id !== cronId));
        } catch (error) {
            console.error('Failed to delete scheduled run:', error);
        }
    }, [collectionId, queryClient]);

    const updateCronStatus = useCallback(async (cronId, status) => {
        try {
            await cronStatus(cronId, status);
            queryClient.setQueryData(['scheduledRuns', collectionId], oldRuns => oldRuns.map(run => run.id === cronId ? { ...run, status: status } : run));
        } catch (error) {
            console.error('Failed to update cron status:', error);
        }
    }, [collectionId, queryClient]);

    return { scheduledRuns, isError, error, deleteCronById, updateCronStatus };
};
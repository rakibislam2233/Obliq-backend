import { ReportRepository } from './reports.repository';

const getSummary = async () => {
  return ReportRepository.getSummary();
};

const getLeadStatusReport = async () => {
  return ReportRepository.getLeadStatusReport();
};

const getTaskStatusReport = async () => {
  return ReportRepository.getTaskStatusReport();
};

const getUserStatusReport = async () => {
  return ReportRepository.getUserStatusReport();
};

export const ReportService = {
  getSummary,
  getLeadStatusReport,
  getTaskStatusReport,
  getUserStatusReport,
};

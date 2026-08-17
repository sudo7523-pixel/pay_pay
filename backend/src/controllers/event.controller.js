import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} from "../services/event.service.js";

const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const create = async (req, res, next) => {
  try {
    const event = await createEvent(req.user.userId, req.body);

    successResponse(res, 201, "Event created successfully", { event });
  } catch (error) {
    next(error);
  }
};

export const list = async (req, res, next) => {
  try {
    const events = await getEvents(req.user.userId, req.query);

    successResponse(res, 200, "Events retrieved successfully", { events });
  } catch (error) {
    next(error);
  }
};

export const get = async (req, res, next) => {
  try {
    const event = await getEvent(req.user.userId, req.params.id);

    successResponse(res, 200, "Event retrieved successfully", { event });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const event = await updateEvent(req.user.userId, req.params.id, req.body);

    successResponse(res, 200, "Event updated successfully", { event });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const event = await deleteEvent(req.user.userId, req.params.id);

    successResponse(res, 200, "Event deleted successfully", { event });
  } catch (error) {
    next(error);
  }
};

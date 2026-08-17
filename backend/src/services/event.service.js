import Event from "../models/Event.js";

export const createEvent = async (userId, eventData) => {
  const event = await Event.create({
    owner: userId,
    ...eventData,
  });

  return event;
};

export const getEvents = async (userId, query = {}) => {
  const filter = { owner: userId };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [
      { name: regex },
      { venue: regex },
      { location: regex },
    ];
  }

  let sortOption = { createdAt: -1 };
  if (query.sort === "name") sortOption = { name: 1 };
  else if (query.sort === "startDate") sortOption = { startDate: 1 };
  else if (query.sort === "-startDate") sortOption = { startDate: -1 };
  else if (query.sort === "status") sortOption = { status: 1 };

  return Event.find(filter).sort(sortOption);
};

export const getEvent = async (userId, eventId) => {
  const event = await Event.findOne({ _id: eventId, owner: userId });

  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  return event;
};

export const updateEvent = async (userId, eventId, updateData) => {
  const allowedUpdates = [
    "name",
    "description",
    "venue",
    "location",
    "startDate",
    "endDate",
    "registrationDeadline",
    "capacity",
    "visibility",
    "status",
    "allowMultipleScans",
    "notes",
  ];

  const updates = {};
  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      updates[key] = updateData[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    const err = new Error("No valid fields provided for update");
    err.statusCode = 400;
    throw err;
  }

  const event = await Event.findOneAndUpdate(
    { _id: eventId, owner: userId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  return event;
};

export const deleteEvent = async (userId, eventId) => {
  const event = await Event.findOneAndDelete({ _id: eventId, owner: userId });

  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  return event;
};

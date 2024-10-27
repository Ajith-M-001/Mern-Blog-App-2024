import Notification from "../Schema/Notification.js";

export const getNotificationAlert = async (req, res) => {
  const { id: user_id } = req.user;
  Notification.exists({
    notification_for: user_id,
    seen: false,
    user: { $ne: user_id },
  })
    .then((result) => {
      if (result) {
        return res.status(200).json({ new_notification_available: true });
      } else {
        return res.status(200).json({ new_notification_available: false });
      }
    })
    .catch((err) => {
      return res.status(500).json({ message: err.message });
    });
};

export const getNotification = async (req, res) => {
  const { id: _id } = req.user;
  let { page, filter, deleteDocCount } = req.body;

  const maxLimit = 10;
  const findquery = { notification_for: _id, user: { $ne: _id } }; // Corrected from user_id to _id
  let skipDocs = (page - 1) * maxLimit;

  if (filter !== "all") {
    findquery.type = filter;
  }

  if (deleteDocCount) {
    skipDocs -= deleteDocCount;
  }

  try {
    // Update the 'seen' status first
   

    // Fetch notifications after marking them as seen
    const notifications = await Notification.find(findquery)
      .skip(skipDocs) // Skip documents for pagination
      .limit(maxLimit) // Limit the number of documents per page
      .populate("blog", "title blog_id") // Populate blog with title and blog_id
      .populate(
        "user",
        "personal_info.fullname personal_info.username personal_info.profile_img"
      ) // Populate user details
      .populate("comment", "comment") // Populate the comment field
      .populate("replied_on_comment", "comment") // Populate the replied_on_comment field
      .populate("reply", "comment") // Populate the reply field
      .sort({ createdAt: -1 }) // Sort by creation date (latest first)
      .select("createdAt type seen reply"); // Select fields to return
    
     await Notification.updateMany(findquery, { seen: true })
       .skip(skipDocs)
       .limit(maxLimit);

    return res.status(200).json(notifications);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const getTotalNotificationCount = async (req, res) => {
  const { id } = req.user;
  const { filter } = req.body;

  let findQuery = { notification_for: id, user: { $ne: id } };

  if (filter !== "all") {
    findQuery.type = filter;
  }

  try {
    const count = await Notification.countDocuments(findQuery); // Fixed the method name
    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
